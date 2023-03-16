FROM node:18.15.0-alpine3.17 as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY src src
COPY tsconfig.json .
RUN npm run build && \
    npm prune --omit=dev && \
    rm -rf src

FROM node:18.15.0-alpine3.17
WORKDIR /app
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/dist dist
ENV NODE_ENV=production
CMD node dist
