# Vanilla Node HTTP Server

### About
This is a HTTP server with some modern API functionality. Written using only the [Node.js](nodejs.org/) Standard Library and the built-in JavaScript language features without additional dependencies (i.e., no `node_modules`). 

### Requirements
* Docker (see below for specs)
```
~/ $ docker version
Client: Docker Engine - Community
 Version:           18.09.2
 API version:       1.39
 Go version:        go1.10.8
 Git commit:        6247962
 Built:             Sun Feb 10 04:12:39 2019
 OS/Arch:           darwin/amd64
 Experimental:      false

Server: Docker Engine - Community
 Engine:
  Version:          18.09.2
  API version:      1.39 (minimum version 1.12)
  Go version:       go1.10.6
  Git commit:       6247962
  Built:            Sun Feb 10 04:13:06 2019
  OS/Arch:          linux/amd64
  Experimental:     true
  ```

### To run
Run `docker-compose up --build` then use Postman to test the API sequence: [![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/3aedd494f3505f43766d)

> The `--build` flag only required for first run or after changes to the ~/Dockerfile

The following endpoints exist:
HTTP Method|Route|Description
-|-|-
GET|/contacts|List all contacts
POST|/contacts|Create a new contact
PUT|/contacts/{id}|Update a contact
GET|/contacts/{id}|Get a specific contact
DELETE|/contacts/{id}|Delete a contact

### Development Environment
The Docker [CMD instruction](https://docs.docker.com/engine/reference/builder/#cmd) triggers a Node process which executes the `watch.js` file with a given `--runtime <EXECUTABLE>`.

The `watch` program first starts the EXECUTABLE as a Node `child_process.fork()` method. [Node states this method is used specifically to spawn new Node processes](https://nodejs.org/docs/latest-v12.x/api/child_process.html#child_process_child_process_fork_modulepath_args_options).

Then the `watch` program uses the Node `fs` module to watch the EXECUTABLE for changes. When a change occurs the `watch` program will kill then start a new process using the update source code.

This logic provides the contributor with a barebones "LiveReload" developer experience without bloat (i.e., dependencies/libraries).
