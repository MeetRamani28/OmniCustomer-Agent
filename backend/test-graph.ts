import { HumanMessage } from '@langchain/core/messages';
import { appGraph } from './src/agents/graph.js';

async function test() {
  try {
    const stream = await appGraph.stream({
      messages: [new HumanMessage('Hello! What kind of things can you help me with?')],
      nextRoute: 'supervisor'
    }, { recursionLimit: 10 });

    for await (const state of stream) {
      console.log('State:', state);
    }
  } catch (err) {
    console.error('ERROR:', err);
  }
}

test();
