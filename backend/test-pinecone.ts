import { hybridSearch } from './src/ai/retrieval.js';
async function run() {
  try {
    await hybridSearch("broken wifi");
  } catch(e) {
    console.error("FAILED:", e);
  }
}
run();
