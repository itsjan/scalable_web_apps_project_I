const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/ping') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('pong\n');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found\n');
  }
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
