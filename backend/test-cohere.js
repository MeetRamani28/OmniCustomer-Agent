import { CohereEmbeddings } from "@langchain/cohere";
import 'dotenv/config';

async function run() {
  console.log("Starting Cohere embed check...");
  const em = new CohereEmbeddings({ apiKey: process.env.COHERE_API_KEY, model: "embed-english-v3.0", inputType: "search_document" });
  try {
    const res = await em.embedQuery("test");
    console.log("Embed success:", res.slice(0, 5));
  } catch(e) {
    console.error("Embed failed:", e);
  }
}
run();
