FROM node:12

WORKDIR /api

COPY ./ /api

CMD [ "node", "watch", "--runtime", "index.js" ]