FROM node:16-alpine3.14
ADD . /app
WORKDIR /app

RUN npm ci
RUN npm run build
ENV NODE_ENV=production
RUN npm prune

ENV VAULT_ADDR=https://vault.teabee.dev
ENV VAULT_ROLE_ID=31023f39-1cc5-52bf-3cb1-81b7bc171a66
CMD npm start
