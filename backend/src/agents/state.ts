import { BaseMessage } from '@langchain/core/messages';
import { Annotation } from '@langchain/langgraph';

// Define the global state schema for the Multi-Agent Swarm
export const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  nextRoute: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => 'supervisor',
  }),
});
