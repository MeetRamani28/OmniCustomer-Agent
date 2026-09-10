const https = require('https');
require('dotenv/config');

const options = {
  hostname: 'api.cohere.ai',
  path: '/v1/models',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
    'Accept': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const models = JSON.parse(data).models;
    const chatModels = models.filter(m => m.endpoints && m.endpoints.includes('chat'));
    console.log("Available chat models:");
    chatModels.forEach(m => console.log(m.name));
  });
});

req.on('error', (e) => {
  console.error(e);
});
req.end();
