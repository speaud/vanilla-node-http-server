# API Assignment

Your task is to build a RESTful API that handles a a shopping cart.  The requirements are outlined below, but you are not expected to complete everything. Please get as far as you can, committing often while you work, and submit within **four hours** of your start time. We recommend reading this entire document before you begin.

A cart contains an array of products, a recipient (person), delivery address, maybe payment method, maybe other attributes you see important.

Two things matter here:

* Thoughtful design of your API (does it convey information to the callee on errors, resource status, links for self and next steps, etc)
* Can you layer in some workflow logic so that a cart with missing or invalid products can be submitted

## Instructions

* Please create a git repo with your work
* Remember to commit often, with descriptive commit messages that illustrate your process.
* Include instructions on how to run your code in the README of the repo.
* Please update your README with explanations of your technical choices. With more time, how might you improve your submission?
* When you are ready, please email a link to your hosted git repo to your contact on the goPuff Engineering team

## Requirements

There is not authentication for this work, anyone can create a cart.

Actions the API should have at minimum:

* Create cart
* Add one or more products to the cart
* Check out a cart to an "Ordered" status
* Retrieve the cart

### Products

Products for the cart in the `products.json` file in the `/src` dir of the repo.  The products will be a known so that you do not have to reproduce that lookup, so the products in the JSON file are the only valid products for this API.

### Repo Structure

This repo contains both a `/src` and a `/dist` directory.  Feel free to add your code into the `/src` the Babel script is set to build to `/dist`, but you can elect to remove them and alter the Babel transpiling.  It's your API and your call.

### Data Storage

You can add in a local Redis or even just use memory to store the cart and its' progression.  Add whatever datastore setup you have implemented into the readme as part of your "how to run" steps.

### Tests and Linting

Tests are very good to have and see...and linting because that's what we do.

## Bonus

If you create a cart API to your liking then, some workflow would be very nice.

### Cart Workflow

An idea of cart workflow is located in the `docs` dir, both a PlantUML as well as the resultant flow.

### Workflow Rules

Some rules that we find sane when using a cart...

* A cart cannot be created and then checked out, a **MINIMUM** of five products must be in the cart for that cart to be Validated
* All products in a cart must be valid from the product API
* When moving the cart to Checkout, an inventory check must be done to ensure that the products in the cart to not exceed the inventory

## Tech

To build the api, you are allowed to use any Node.js-based technologies you'd like, but please:

* JavaScript...not TypeScript
* ES6 and transpiling via Babel

### Frameworks and Libraries

We tend to like some frameworks, but if you have a strong opinion of something else we'd love to see it.

* Express, Koa
* Superagent, Axios
* Mocha, Expect, Jest, etc

Babel and some other dev dependencies have been added to this repo, but feel free to change/tweak/remove whatever you feel you don't need or are missing. Check the `package.json` for a couple pre-created scripts if that helps.
