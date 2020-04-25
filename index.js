const http = require('http');

const { products: products_data, search_meta: products_meta } = require('./products.json')

const { CONTAINER_API_PORT, LOCALHOST_API_PORT } = process.env

const logr = msg => console.log(`>> SERVER: ${msg}`)

class JSONResponse {
	constructor(meta, data) {
		this.meta = meta
		this.data = data
	}
}

class Endpoint {
	constructor(method, path, handler) {
		this.method = method
		this.path = path
		this.handler = handler
	}
}

let endpoints = [
	new Endpoint('GET', '/products', getProducts)
]

function notFound(req, res) {
	res.writeHead(404, { 'Content-Type': 'application.json' });
	var json = JSON.stringify(new JSONResponse({ message: `Endpoint is not registered`, method: req.method, url: req.url}));
	res.end(json)
}

function getProducts(req, res) {
	res.writeHead(200, { 'Content-Type': 'application.json' });
	var json = JSON.stringify(new JSONResponse(products_meta, products_data));
	res.end(json)
}

http
	.createServer((req, res) => {
		let endpoint = endpoints.filter(e => e.method == req.method && RegExp(`^${e.path}$`).test(req.url))
		endpoint = endpoint[0]

		if (endpoint === undefined) return notFound(req, res)
		
		try {
			const { handler } = endpoint

			handler(req, res);
		}
		catch(error) {
			console.error(`Endpoint ${endpoint.method} ${endpoint.path}: ${error}`)
		}
	})
	.listen(CONTAINER_API_PORT, () => {
		logr(`Docker container exposes port - ${CONTAINER_API_PORT} `)
		logr(`Localhost listening on - http://localhost:${LOCALHOST_API_PORT} (point Postman here)`)
	});