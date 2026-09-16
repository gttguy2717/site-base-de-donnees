const http = require('http');

const body = JSON.stringify({
  identifier: 'sorhodavid31@gmail.com',
  password: 'admin123456'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('BODY:', data);
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.log('ERROR:', e.message);
  process.exit(1);
});

req.write(body);
req.end();
