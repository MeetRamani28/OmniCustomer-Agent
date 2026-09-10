const { CohereEmbeddings } = require("@langchain/cohere");
require('dotenv/config');

async function run() {
  const em = new CohereEmbeddings({ apiKey: process.env.COHERE_API_KEY, model: "embed-english-v3.0", inputType: "search_document" });
  try {
    const res = await em.embedDocuments(["test"]);
    console.log("Embed result:", JSON.stringify(res));
  } catch(e) {
    console.error("Embed failed:", e);
  }
}
run();
