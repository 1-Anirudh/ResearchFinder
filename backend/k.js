const https = require('https');
const fs = require('fs');
const express = require('express');
const app = express();

const HOST = 'localhost';
const PORT = 443; // Default port for HTTPS

// Read SSL certificate and key
const options = {
  key: fs.readFileSync('keys/private.key'),
  cert: fs.readFileSync('keys/certificate.crt')
};

// Create HTTPS server
https.createServer(options, app).listen(PORT, HOST, () => {
  console.log(`Server running on https://${HOST}:${PORT}`);
});

// Your existing Express app code here
app.get('/', (req, res) => {
  res.send('Hello, HTTPS world!');
});