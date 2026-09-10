const { ChatCohere } = require("@langchain/cohere");
require('dotenv/config');

async function run() {
  const model = new ChatCohere({ apiKey: process.env.COHERE_API_KEY, model: "command-r" });
  try {
    const res = await model.invoke("Hello, who are you? Please reply in Gujarati.");
    console.log("Success:", res.content);
  } catch(e) {
    console.error("Failed:", e.response ? e.response.data : e.message);
  }
}
run();
