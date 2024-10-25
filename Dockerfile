ARG NODE_VERSION=21
FROM node:${NODE_VERSION}-alpine

ARG PORT=3784
ARG DB_URL

WORKDIR /app

COPY ./package.json ./yarn.lock ./

ENV YARN_CACHE_FOLDER=/root/.yarn
RUN --mount=type=cache,target=/root/.yarn yarn install

COPY . .
ENV NUXT_DB_CONNECTION_STRING=${DB_URL}
RUN npx prisma generate --sql
RUN --mount=type=cache,target=/root/.yarn yarn build

RUN --mount=type=cache,target=/root/.yarn rm -rf node_modules && yarn install --ignore-scripts --omit=dev

ENV NODE_ENV=PRODUCTION
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=${PORT}

EXPOSE ${PORT}

CMD [ "node", "./.output/server/index.mjs" ]
