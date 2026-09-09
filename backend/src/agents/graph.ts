import { StateGraph, START, END } from '@langchain/langgraph';
import { AgentState } from './state.js';
import { supervisorNode } from './supervisor.js';
import { logisticsNode, technicalSupportNode, financeNode, generalNode } from './specialists.js';

const workflow = new StateGraph(AgentState)
  .addNode('supervisor', supervisorNode)
  .addNode('logistics', logisticsNode)
  .addNode('technical_support', technicalSupportNode)
  .addNode('finance', financeNode)
  .addNode('general', generalNode);

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
