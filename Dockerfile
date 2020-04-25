FROM node:12

WORKDIR /api

COPY ./ /api

CMD [ "node", "index.js" ]