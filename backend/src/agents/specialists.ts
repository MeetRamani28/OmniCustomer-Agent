import { ChatCohere } from '@langchain/cohere';
import { SystemMessage } from '@langchain/core/messages';
import { AgentState } from './state.js';
import { hybridSearch } from '../ai/retrieval.js';
import 'dotenv/config';

const llm = new ChatCohere({
  apiKey: process.env.COHERE_API_KEY,
  model: 'command-r',
  temperature: 0.2,
});

// --- 1. Logistics Specialist ---
const LOGISTICS_PROMPT = `You are the OmniCustomer Logistics Specialist.
Resolve shipping, tracking, and inventory queries.
You have direct access to warehouse systems. Be concise and authoritative.`;

export const logisticsNode = async (state: typeof AgentState.State) => {
  console.log('[Agent: Logistics] Processing request...');
  const messages = [
    new SystemMessage(LOGISTICS_PROMPT),
    ...state.messages,
  ];
  const response = await llm.invoke(messages);
  return { messages: [response], nextRoute: 'FINISH' };
};

// --- 2. Technical Support Specialist (RAG Integrated) ---
const TECH_SUPPORT_PROMPT = `You are the OmniCustomer Technical Support Specialist.
Answer the user's question based strictly on the provided Context. 
If the answer is not in the context, state that you need to escalate the ticket.`;

export const technicalSupportNode = async (state: typeof AgentState.State) => {
  console.log('[Agent: Tech Support] Querying vector DB for RAG context...');
  const lastMessage = state.messages[state.messages.length - 1]?.content || '';
  const query = typeof lastMessage === 'string' ? lastMessage : JSON.stringify(lastMessage);
  
  const searchResults = await hybridSearch(query);
  
  // Extract page contents securely
  const vectorContext = searchResults.vectorDocs.map((doc: any) => doc.pageContent).join('\n');
  const keywordContext = searchResults.keywordDocs.map((doc: any) => doc.content).join('\n');
  
  const combinedContext = `--- Vector Context ---\n${vectorContext}\n--- Keyword Context ---\n${keywordContext}`;
  
  const ragPrompt = `${TECH_SUPPORT_PROMPT}\n\nContext:\n${combinedContext}`;
  
  const messages = [
    new SystemMessage(ragPrompt),
    ...state.messages,
  ];
  
  const response = await llm.invoke(messages);
  return { messages: [response], nextRoute: 'FINISH' };
};

// --- 3. Finance Escalation Specialist ---
const FINANCE_PROMPT = `You are the OmniCustomer Finance Specialist.
You handle refund requests and billing. 
Always be polite. Inform the user that refunds require strict policy checks before processing.`;

export const financeNode = async (state: typeof AgentState.State) => {
  console.log('[Agent: Finance] Analyzing escalation request...');
  const messages = [
    new SystemMessage(FINANCE_PROMPT),
    ...state.messages,
  ];
  const response = await llm.invoke(messages);
  return { messages: [response], nextRoute: 'FINISH' };
};

// --- 4. General Conversationalist ---
const GENERAL_PROMPT = `You are the OmniCustomer Greeter. 
Provide a friendly, brief response and ask how you can specifically help with logistics, tech support, or billing today.`;

export const generalNode = async (state: typeof AgentState.State) => {
  console.log('[Agent: General] Handling standard conversation...');
  const messages = [
    new SystemMessage(GENERAL_PROMPT),
    ...state.messages,
  ];
  const response = await llm.invoke(messages);
  return { messages: [response], nextRoute: 'FINISH' };
};
