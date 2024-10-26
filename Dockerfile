ARG NODE_VERSION=21
FROM node:${NODE_VERSION}-alpine

ARG PORT=3784

WORKDIR /app

COPY ./package.json ./yarn.lock ./

ENV YARN_CACHE_FOLDER=/root/.yarn
RUN --mount=type=cache,target=/root/.yarn yarn install

COPY . .
RUN --mount=type=cache,target=/root/.yarn yarn prisma:generate
RUN --mount=type=cache,target=/root/.yarn yarn build

RUN --mount=type=cache,target=/root/.yarn rm -rf node_modules && yarn install --ignore-scripts --omit=dev

ENV NODE_ENV=PRODUCTION
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=${PORT}

EXPOSE ${PORT}

CMD [ "yarn", "prod" ]
