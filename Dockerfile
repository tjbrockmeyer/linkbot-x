FROM node:16-alpine3.14
ADD . /code
WORKDIR /code

RUN npm ci
RUN npm run test:ci
RUN npm run build
ENV NODE_ENV=production
RUN npm prune

CMD npm start
