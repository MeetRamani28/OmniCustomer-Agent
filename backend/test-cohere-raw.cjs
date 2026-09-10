const https = require('https');
require('dotenv/config');

const data = JSON.stringify({
  model: 'command-r-08-2024',
  message: 'Hello, reply in Gujarati.'
});

const options = {
  hostname: 'api.cohere.ai',
  path: '/v1/chat',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let resData = '';
  res.on('data', (d) => resData += d);
  res.on('end', () => console.log(resData));
});
req.on('error', console.error);
req.write(data);
req.end();
