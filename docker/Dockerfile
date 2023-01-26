FROM node:16-alpine3.14 as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY src src
COPY tsconfig.json .
RUN npm run build && \
    npm prune --omit=dev && \
    rm -rf src

# ===========
# FINAL IMAGE
# ===========
FROM node:16-alpine3.14
WORKDIR /app
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/dist dist
COPY .config.json ./
ENV NODE_ENV=production
CMD node dist
