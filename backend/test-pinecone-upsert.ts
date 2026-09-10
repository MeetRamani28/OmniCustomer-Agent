import { getPineconeStore } from './src/ai/pinecone.js';
import { Document } from '@langchain/core/documents';

async function run() {
  const store = await getPineconeStore();
  const doc = new Document({ pageContent: "Test", metadata: { source: "test" }});
  console.log("Adding doc directly to PineconeStore...");
  await store.addDocuments([doc]);
  console.log("Done.");
}
run();
