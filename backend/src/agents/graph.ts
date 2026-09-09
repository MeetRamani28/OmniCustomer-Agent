import { StateGraph, START, END } from '@langchain/langgraph';
import { AgentState } from './state.js';
import { supervisorNode } from './supervisor.js';

// Step 6 will implement these properly. Mocks for now to successfully compile the state machine.
const mockNode = async (state: typeof AgentState.State) => {
  console.log(`[Agent: Mock] Executing specialist route: ${state.nextRoute}`);
  return { nextRoute: 'FINISH' };
};

const workflow = new StateGraph(AgentState)
  .addNode('supervisor', supervisorNode)
  .addNode('logistics', mockNode)
  .addNode('technical_support', mockNode)
  .addNode('finance', mockNode)
  .addNode('general', mockNode);

// Define orchestration edges
workflow.addEdge(START, 'supervisor');

// Conditional routing based on the supervisor's decision
workflow.addConditionalEdges(
  'supervisor',
  (state) => state.nextRoute,
  {
    logistics: 'logistics',
    technical_support: 'technical_support',
    finance: 'finance',
    general: 'general',
  }
);

workflow.addEdge('logistics', END);
workflow.addEdge('technical_support', END);
workflow.addEdge('finance', END);
workflow.addEdge('general', END);

// Compile the highly fault-tolerant cyclic/acyclic graph
export const appGraph = workflow.compile();
