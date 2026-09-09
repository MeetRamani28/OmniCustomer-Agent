import { ChatCohere } from '@langchain/cohere';
import { SystemMessage } from '@langchain/core/messages';
import { AgentState } from './state.js';
import 'dotenv/config';

// Central LLM router initialized with Cohere
const llm = new ChatCohere({
  apiKey: process.env.COHERE_API_KEY,
  model: 'command-r', // Using Command R for advanced fast routing
  temperature: 0.1,
});

const SUPERVISOR_SYSTEM_PROMPT = `You are the elite Central Supervisor Agent for OmniCustomer.
Your sole responsibility is to analyze the user's message and route it to the correct specialist sub-agent.

Available Routes:
- "logistics": For shipping, delivery, track order, or inventory questions.
- "technical_support": For troubleshooting and product usage.
- "finance": For refunds, billing, and compensation.
- "general": For generic questions or greetings.

Respond ONLY with the exact string of the route name. Do not include punctuation or extra words.`;

export const supervisorNode = async (state: typeof AgentState.State) => {
  console.log('[Agent: Supervisor] Analyzing user intent...');
  
  const messages = [
    new SystemMessage(SUPERVISOR_SYSTEM_PROMPT),
    ...state.messages,
  ];
  
  const response = await llm.invoke(messages);
  const decision = (response.content as string).trim().toLowerCase();
  
  // Strict fallback parsing to guarantee graph progression and fault tolerance
  const validRoutes = ['logistics', 'technical_support', 'finance', 'general'];
  const nextRoute = validRoutes.includes(decision) ? decision : 'general';
  
  console.log(`[Agent: Supervisor] Decision made. Routing to -> ${nextRoute}`);
  
  return { nextRoute };
};
