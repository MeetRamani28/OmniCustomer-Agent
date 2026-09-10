const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
async function run() {
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 400, chunkOverlap: 50 });
  const docs = await splitter.createDocuments(["Fixing wifi requires restarting the router."]);
  console.log(docs);
}
run();
