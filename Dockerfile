FROM node:16-alpine3.14

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY src src
COPY tsconfig.json .
RUN npm run build && \
    npm prune --omit=dev && \
    rm -rf src

COPY .config.json .

ENV NODE_ENV=production
CMD npm start
