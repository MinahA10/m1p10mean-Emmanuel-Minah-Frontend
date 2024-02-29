const http = require('http');
const fs = require('fs');
const path = require('path');

http.createServer((req, res) => {
    const filePath = path.join(__dirname, 'index.html');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.writeHead(500);
            res.end('Internal server error');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        }
    });
}).listen(8080, () => {
    console.log('Server running at http://localhost:8080/');
});
