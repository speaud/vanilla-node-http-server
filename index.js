const http = require('http');

const { CONTAINER_API_PORT, LOCALHOST_API_PORT } = process.env

const logr = msg => console.log(`>> SERVER: ${msg}`)

function reqBodyParser(b) {
	let args = {}
	b
		.toString()
		.split('&')
		.map(x => x.split('='))
		.forEach(a => args[a[0]] = a[1]);
		
	return args
}

function reqUrlIdParser(u) {
	return parseInt(u.split('/')[2])
}

function autoIncrementId(c) {
	const nextId = [...c].map(e => e[1]).length + 1

	if (!contacts.get(nextId)) {
		return nextId
	} else {
		throw new CustomError(`Contact already exists in pseudo DB (id=${nextId})`)
	}
}

function notFound(req, res) {
	const jsonResponse = new JSONResponse(null, { message: `Endpoint is not registered`, method: req.method, url: req.url })
	jsonResponse.send(res, 404)
}

function flattenContact(c, updatedFields) {
	let contact = {
		id: c.id,
		...c.name,
		...c.address,
		...c.phone,
		email: c.email,
		...updatedFields
	}

	return Object.keys(contact).map(e => contact[e])
}

class CustomError extends Error {
	constructor(...params) {
	  // Pass remaining arguments (including vendor specific ones) to parent constructor
	  super(...params)
  
	  // Maintains proper stack trace for where our error was thrown (only available on V8)
	  if (Error.captureStackTrace) {
		Error.captureStackTrace(this, CustomError)
	  }
  
	  this.name = 'CustomError'
	  this.date = new Date()
	}
  }

class JSONResponse {
	constructor(data, error) {
		this.data = data
		this.error = error
	}

	send(res, status) {
		res.writeHead(status || 200, { 'Content-Type': 'application/json' })
		const json = JSON.stringify(this.data)
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

class Contact {
	constructor(id, first_name, middle_name, last_name, street, city, state, zip, phone_number, phone_type, email) {
		this.id = id;
		this.name = {
			first_name: first_name,
			middle_name: middle_name,
			last_name: last_name
		};
		this.address = {
			street: street,
			city: city,
			state: state,
			zip: zip

		}
		this.phone = {
			phone_number: phone_number,
			phone_type: phone_type,
		},
		this.emai = email
	}
}

let contacts = new Map();

contacts.set(1, new Contact(1, 'Jay', 'John', 'Smith', '123 Main', 'Philly', 'PA', '19107', '1231231234', 'cell', 'noreply@whoknows.com'))
contacts.set(2, new Contact(2, 'May', 'Marie', 'Smith', '123 Main', 'Philly', 'PA', '19107', '4443332222', 'cell', 'may@whoknows.com'))

function getContacts(req, res) {
	const data = [...contacts].map(e => e[1])
	const jsonResponse = new JSONResponse(data)

	jsonResponse.send(res)
}

function createContact(req, res) {
	const nextId = autoIncrementId(contacts)

	req.on('data', chunk => {
		const data = reqBodyParser(chunk)
		console.log(data)
	
		contacts.set(nextId, new Contact(nextId, data.first_name, data.middle_name, data.last_name, data.street, data.city, data.state, data.zip, data.phone_number, data.phone_type, data.email))
		
		const contact = contacts.get(nextId)
		const jsonResponse = contact ? new JSONResponse(contact) : new JSONResponse({ message: 'Contact was not created' })

		jsonResponse.send(res)
	})
}

function updateContact(req, res) {
	const contactId = reqUrlIdParser(req.url)
	let contact = contacts.get(contactId)

	req.on('data', chunk => {
		const data = reqBodyParser(chunk)
		console.log(data)

		const updatedContact = flattenContact(contact, data)

		contacts.set(contactId, new Contact(...updatedContact))
		contact = contacts.get(contactId)
		
		const jsonResponse = contact ? new JSONResponse(contact) : new JSONResponse({ message: 'Contact does not exist' })
		jsonResponse.send(res)
	})	
}

function getContact(req, res) {
	const contactId = reqUrlIdParser(req.url)
	const contact = contacts.get(contactId)

	const jsonResponse = contact ? new JSONResponse(contact) : new JSONResponse({ message: 'Contact not found' })

	jsonResponse.send(res)
}

function deleteContact(req, res) {
	const contactId = reqUrlIdParser(req.url)
	const contact = contacts.get(contactId)

	try {
		if (contact) {
			contacts.delete(contactId)
		}
	} catch (error) {
		const jsonResponse = new JSONResponse({ message: 'Error contact was not deleted' }, error)

		return jsonResponse.send(res)
	}
	
	const jsonResponse = contact ? new JSONResponse({ message: 'Contact was deleted' }) : new JSONResponse({ message: 'Contact not found' })

	jsonResponse.send(res)
}

const endpoints = [
	new Endpoint('GET', '/contacts', getContacts),
	new Endpoint('POST', '/contacts', createContact),
	new Endpoint('PUT', '/contacts/[0-9]+', updateContact),
	new Endpoint('GET', '/contacts/[0-9]+', getContact),
	new Endpoint('DELETE', '/contacts/[0-9]+', deleteContact)
]

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