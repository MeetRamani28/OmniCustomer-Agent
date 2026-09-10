import { initRetriever } from './src/ai/retrieval.js';
import { Document } from '@langchain/core/documents';

async function run() {
  const doc = new Document({ pageContent: "Fixing wifi requires restarting the router.", metadata: { source: "test" }});
  const retriever = await initRetriever();
  console.log("Adding docs...");
  await retriever.addDocuments([doc]);
  console.log("Done.");
}
run();
