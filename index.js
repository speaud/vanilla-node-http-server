const http = require('http');

const { CONTAINER_API_PORT, LOCALHOST_API_PORT } = process.env

const logr = msg => console.log(`>> SERVER: ${msg}`)

http
	.createServer((req, res) => {
		res.writeHead(200, { 'Content-Type': 'application.json' });
		res.end(JSON.stringify({ foo: 1 }));
	})
	.listen(CONTAINER_API_PORT, () => {
		logr(`Docker container exposes port - ${CONTAINER_API_PORT} `)
		logr(`Localhost listening on - http://localhost:${LOCALHOST_API_PORT} (point Postman here)`)
	});