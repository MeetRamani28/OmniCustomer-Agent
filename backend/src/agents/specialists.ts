import { ChatCohere } from '@langchain/cohere';
import { SystemMessage, AIMessage, ToolMessage } from '@langchain/core/messages';
import { AgentState } from './state.js';
import { hybridSearch } from '../ai/retrieval.js';
import { dbService } from '../db/index.js';
import 'dotenv/config';

const llm = new ChatCohere({
  apiKey: process.env.COHERE_API_KEY,
  model: 'command-r-08-2024',
});

// --- 1. Logistics Specialist (High-Speed Context Injection) ---
export const logisticsNode = async (state: typeof AgentState.State) => {
  console.log('[Agent: Logistics] Processing request with Ultra-Fast Context Injection...');
  
  // Pre-fetch DB context instantly instead of waiting for a slow LLM Tool Call round-trip
  const orders = await dbService.getOrders(10);
  const dbContext = JSON.stringify(orders, null, 2);

  const LOGISTICS_PROMPT = `You are the OmniCustomer Logistics Specialist.
Resolve shipping, tracking, and inventory queries.
You must understand multiple languages including Gujarati and Hindi. Always reply in the language the user spoke.
Here is the real-time database context of active orders:
${dbContext}

If the user asks about an order, match it to this context and provide a highly professional, accurate response. If they don't provide an order ID, ask for it. Do not hallucinate.`;

  const messages = [
    new SystemMessage(LOGISTICS_PROMPT),
    ...state.messages,
  ];
  
  const response = await llm.invoke(messages);
  return { messages: [response], nextRoute: 'FINISH' };
};

// --- 2. Technical Support Specialist (RAG + Citations) ---
export const technicalSupportNode = async (state: typeof AgentState.State) => {
  console.log('[Agent: Tech Support] Querying vector DB for RAG context...');
  const lastMessage = state.messages[state.messages.length - 1]?.content || '';
  const query = typeof lastMessage === 'string' ? lastMessage : JSON.stringify(lastMessage);
  
  const searchResults = await hybridSearch(query);
  
  const vectorContext = searchResults.vectorDocs.map((doc: any, i: number) => `[Doc ${i+1}] ${doc.pageContent}`).join('\n');
  const combinedContext = `--- Vector Context ---\n${vectorContext}`;
  
  const TECH_SUPPORT_PROMPT = `You are the OmniCustomer Technical Support Specialist.
You must understand multiple languages including Gujarati and Hindi. Always reply in the language the user spoke.
Answer the user's question based strictly on the provided Context. 
CRITICAL RULE: You MUST cite your sources using the document numbers provided in the context (e.g., "According to [Doc 1]...").
If the answer is not in the context, state that you need to escalate the ticket. Do not hallucinate.

Context:
${combinedContext}`;
  
  const messages = [
    new SystemMessage(TECH_SUPPORT_PROMPT),
    ...state.messages,
  ];
  
  const response = await llm.invoke(messages);
  return { messages: [response], nextRoute: 'FINISH' };
};

// --- 3. Finance Escalation Specialist ---
export const financeNode = async (state: typeof AgentState.State) => {
  console.log('[Agent: Finance] Processing finance request...');

  const FINANCE_PROMPT = `You are the OmniCustomer Finance Specialist.
You handle refunds, billing, payment edits, and discounts.
You must understand multiple languages including Gujarati and Hindi. Always reply in the language the user spoke.
IMPORTANT RULE: For any payment edits or discount requests, you MUST state that you have notified the company's person and respond with "Please call this number: 1-800-COMPANY for that". Do not make unauthorized edits or hallucinate policies.`;

  const messages = [
    new SystemMessage(FINANCE_PROMPT),
    ...state.messages,
  ];
  const response = await llm.invoke(messages);
  return { messages: [response], nextRoute: 'FINISH' };
};

// --- 4. General Conversationalist ---
export const generalNode = async (state: typeof AgentState.State) => {
  console.log('[Agent: General] Handling standard conversation...');
  const GENERAL_PROMPT = `You are the OmniCustomer Greeter. 
You must understand multiple languages including Gujarati and Hindi. Always reply in the language the user spoke.
Provide a friendly, brief response and ask how you can specifically help with logistics, tech support, or billing today.`;

  const messages = [
    new SystemMessage(GENERAL_PROMPT),
    ...state.messages,
  ];
  const response = await llm.invoke(messages);
  return { messages: [response], nextRoute: 'FINISH' };
};

// --- 5. Security Guard Node ---
export const securityBlockNode = async (state: typeof AgentState.State) => {
  console.log('[Agent: Guard] Generating security block response...');
  const blockMsg = new AIMessage("🛡️ SECURITY ALERT: I cannot fulfill that request. Your input has been flagged by our security protocols for unauthorized instructions or inappropriate content. Please rephrase your request.");
  return { messages: [blockMsg], nextRoute: 'FINISH' };
};

// --- 6. Human Handoff Node ---
export const humanHandoffNode = async (state: typeof AgentState.State) => {
  console.log('[Agent: Escalation] Generating human handoff response...');
  const escalateMsg = new AIMessage("🚨 PRIORITY ESCALATION: I sincerely apologize for the frustration you are experiencing. I am escalating your case to a live human manager immediately. Someone will be with you in just a moment.");
  return { messages: [escalateMsg], nextRoute: 'FINISH' };
};
