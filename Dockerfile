FROM node:14
WORKDIR /usr/src/app
COPY .env.example index.js package.json yarn.lock  ./
RUN yarn install
ENV PORT 3000
EXPOSE 3000
CMD [ "node", "index.js" ]