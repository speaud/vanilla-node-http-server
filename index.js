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
	constructor(meta, data, error) {
		this.meta = meta
		this.data = data
		this.error = error
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
	new Endpoint('PUT', '/carts/[0-9]+', checkoutCart),
	new Endpoint('PUT', '/carts/[0-9]+/products', addProductsToCart)
]

let carts = []

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
	const jsonResponse = new JSONResponse(null, null, { message: `Endpoint is not registered`, method: req.method, url: req.url })
	jsonResponse.send(res, 404)
}

function getProducts(req, res) {
	const jsonResponse = new JSONResponse(products_meta, products_data)
	jsonResponse.send(res)
}

function createCart(req, res) {
	req.on('data', chunk => {
		const { customerId } = reqBodyParser(chunk)

		const customer = customers.filter(c => c.id == customerId)
		if (customer.length === 0) {
			const jsonResponse = new JSONResponse(null, null, { message: 'Invalid customer id', customerId: customerId })
			jsonResponse.send(res)
			return
		}

		const hasActiveCart = carts.filter(c => c.customerId == customerId && c.status != statusLookup.ordered)
		if (hasActiveCart.length != 0) {
			const jsonResponse = new JSONResponse({ activeCart: hasActiveCart }, null, { message: 'Customer has active cart', customerId: customerId })
			jsonResponse.send(res)
			return
		}

		const createdCart = new Cart(carts.length + 1, parseInt(customerId))
	
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

function checkoutCart(req, res) {
	const cartId = parseInt(req.url.split('/')[2])

	carts.forEach(c => {
		if (c.id == cartId) {
			c.status = statusLookup.ordered
		}
		return c
	})

	const jsonResponse = new JSONResponse({}, carts.filter(c => c.id == cartId)[0])
	jsonResponse.send(res)	
}

function addProductsToCart(req, res) {
	req.on('data', chunk => {
		let { productIds, quantities } = reqBodyParser(chunk)
		productIds = unescape(productIds).split(',')
		quantities = unescape(quantities).split(',')

		if (productIds.length != quantities.length) {
			const jsonResponse = new JSONResponse({ productIds, quantities }, null, { message: `Invalid request body parameters. Entires do not match, missing 'product-quanity' pair. ` })
			jsonResponse.send(res)
		}
		
		const cartId = parseInt(req.url.split('/')[2])
		const cartIsActive = carts.filter(c => c.id == cartId && c.status != statusLookup.ordered)

		if (cartIsActive.length === 0) {
			const jsonResponse = new JSONResponse({ cardId: cartId }, null, { message: 'Cart does not exist' })
			jsonResponse.send(res)
		}
		
		let pqs = productIds.map((p, i) => [p, quantities[i]])
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