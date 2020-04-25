const http = require('http');

const { products: products_data, search_meta: products_meta } = require('./products.json')

const { CONTAINER_API_PORT, LOCALHOST_API_PORT } = process.env

const statusLookup = {
	//cancel: 0,	?
	created: 1,
	valid: 2, // some condition met (e.g., more than N items)
	ordered: 3
	//delivered: 4	?
}

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

// [from exercise readme] A cart contains an array of products, a recipient (person), delivery address, maybe payment method, maybe other attributes you see important
class Cart {
	constructor(id, customerId, products = [], status = statusLookup.created) {
		this.id = id;
		this.customerId = customerId;
		this.products = products; // entries treated as tuple [[product id, quanity], ...]
		this.status = status;
	}
}

class Customer {
	constructor(id, name, address) {
		this.id = id;
		this.name = name;
		this.address = address;
	}
}

let endpoints = [
	new Endpoint('GET', '/products', getProducts),
	new Endpoint('POST', '/carts', createCart)
]

let carts = [
	new Cart(1, 1)
]

let customers = [
	new Customer(1, `Phil Adelphia`, `123 Broad St.`)
]

function reqBodyParser(buffer) {
	let args = {}
	buffer
		.toString()
		.split('&')
		.map(x => x.split('='))
		.forEach(a => args[a[0]] = a[1]);
		
	return args
}

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

function createCart(req, res) {
	req.on('data', chunk => {
		const { customerId } = reqBodyParser(chunk)

		// @todo extend this to validate the customer/cart
		
		const id = carts.length + 1

		// @todo 	should validate the customer does not have a current "active" cart before adding
		//			then handle error 

		const createdCart = new Cart(id, parseInt(customerId))
	
		carts.push(createdCart)
	
		res.writeHead(200, { 'Content-Type': 'application.json' });
		const json = JSON.stringify(new JSONResponse({ totalActiveCartCount: carts.length }, [createdCart]));
		res.end(json)
	})
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