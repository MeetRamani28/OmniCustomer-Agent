const fs = require('fs');
async function run() {
  // Use native fetch and FormData (Node 18+)
  const blob = new Blob([fs.readFileSync('sample_knowledge.txt')], { type: 'text/plain' });
  const form = new FormData();
  form.append('file', blob, 'sample_knowledge.txt');
  
  const res = await fetch('http://localhost:5000/api/upload', {
    method: 'POST',
    body: form,
  });
  console.log(await res.json());
}
run();
