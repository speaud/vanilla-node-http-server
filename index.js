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

	send(res, status) {
		res.writeHead(status || 200, { 'Content-Type': 'application/json' })
		const json = JSON.stringify(this)
		res.end(json)
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
	new Endpoint('POST', '/carts', createCart),
	new Endpoint('GET', '/carts/[0-9]+', getCart),
	new Endpoint('PUT', '/carts/[0-9]+/products', addProductsToCart)
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
	const jsonResponse = new JSONResponse({ message: `Endpoint is not registered`, method: req.method, url: req.url })
	jsonResponse.send(res, 404)
}

function getProducts(req, res) {
	const jsonResponse = new JSONResponse(products_meta, products_data)
	jsonResponse.send(res)
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
	
		const jsonResponse = new JSONResponse({ totalActiveCartCount: carts.length }, [createdCart])
		jsonResponse.send(res)
	})
}

function getCart(req, res) {
	const cartId = parseInt(req.url.split('/')[2])
	const cart = carts.filter(c => c.id == cartId)
	
	const jsonResponse = new JSONResponse({}, cart)
	jsonResponse.send(res)
}

function addProductsToCart(req, res) {
	req.on('data', chunk => {
		const { productIds, quantities } = reqBodyParser(chunk)
		
		const cartId = parseInt(req.url.split('/')[2])
		// @todo validate the cartId
		
		const ps = unescape(productIds).split(',')
		const qs = unescape(quantities).split(',')
		let pqs = ps.map((p, i) => [p, qs[i]])
		// @todo validate the productId and quanity as Q (Q xref with products.product.quanity)
		
		carts = carts.filter(c => {
			if (c.id == cartId) {
				c.products = [...c.products, ...pqs]
				c.status = statusLookup.valid
			}

			return c
		})
		
		const jsonResponse = new JSONResponse({}, carts)
		jsonResponse.send(res)
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