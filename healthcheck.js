// Script simple de healthcheck para Docker
// Devuelve código 0 si el puerto está abierto
const http = require('http');
const options = { host: 'localhost', port: process.env.PORT || 3000, path: '/api/health' };
const req = http.request(options, res => {
  if (res.statusCode === 200) process.exit(0);
  else process.exit(1);
});
req.on('error', () => process.exit(1));
req.end();