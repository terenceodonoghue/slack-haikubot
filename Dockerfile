FROM node:14 AS builder

WORKDIR /usr/src/app
COPY src ./src
COPY package.json tsconfig.json yarn.lock  ./

RUN yarn install
RUN yarn build

FROM node:14

ENV NODE_ENV production
ENV PORT 3000

WORKDIR /usr/src/app
COPY .env.example package.json yarn.lock ./
COPY --from=builder /usr/src/app/dist ./

RUN yarn install

CMD [ "node", "index.js" ]
EXPOSE 3000
