FROM node:lts-alpine3.19

RUN mkdir /app
WORKDIR /app
RUN chown node:node ./

COPY package*.json .
RUN npm i && npm cache clean --force
COPY . .

RUN apk update && apk add openssl
RUN npx gentls
ENV PORT=9432
EXPOSE 9432

CMD [ "node", "server.js" ]