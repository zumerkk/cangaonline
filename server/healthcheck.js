// 🏥 Health Check Script for Docker
const http = require('http');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 5001,
  path: '/api/health',
  method: 'GET',
  timeout: 2000
};

const req = http.request(options, (res) => {
  console.log(`Health check status: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0); // Success
  } else {
    process.exit(1); // Failure
  }
});

req.on('error', (err) => {
  console.error('Health check failed:', err.message);
  process.exit(1); // Failure
});

req.on('timeout', () => {
  console.error('Health check timeout');
  req.destroy();
  process.exit(1); // Failure
});

req.end(); 