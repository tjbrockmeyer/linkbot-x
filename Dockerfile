FROM node:16-alpine3.14
ADD . /app
WORKDIR /app

ENV NODE_ENV=production
RUN npm ci
CMD npm start
