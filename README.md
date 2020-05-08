# TBD - ...

### Requirements
* Docker 
```
~/node-stdlib-api-server (master) $ docker version
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
Run `docker-compose up --build` then use Postman's Collection Runner to test the API sequence: [![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/3aedd494f3505f43766d#?env%5BNSAS%5D=W3sia2V5IjoiQVBJIiwidmFsdWUiOiJsb2NhbGhvc3Q6NzAwMSIsImVuYWJsZWQiOnRydWV9LHsia2V5IjoiQ1VTVE9NRVJfSUQiLCJ2YWx1ZSI6IjEiLCJlbmFibGVkIjp0cnVlfSx7ImtleSI6IkNBUlRfSUQiLCJ2YWx1ZSI6IjEiLCJlbmFibGVkIjp0cnVlfSx7ImtleSI6IlBST0RVQ1RfSURfMSIsInZhbHVlIjoiIiwiZW5hYmxlZCI6ZmFsc2V9LHsia2V5IjoiUFJPRFVDVF9JRF8wIiwidmFsdWUiOjEwNzQsImVuYWJsZWQiOnRydWV9LHsia2V5IjoiUFJPRFVDVF9JRF8xIiwidmFsdWUiOjI1ODgsImVuYWJsZWQiOnRydWV9XQ==)

> The `--build` flag only required for first run or after changes to the ~/Dockerfile

The following endpoints exist:
* GET /products
* POST /carts
* GET /carts/:cartId
* PUT /carts/:cartId
* PUT /carts/:cartId/products
