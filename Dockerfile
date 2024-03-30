ARG NODE_VERSION=21
ARG PORT=3784



FROM node:${NODE_VERSION}-alpine
WORKDIR /app

COPY . .

RUN yarn install && yarn build
RUN rm -rf node_modules && yarn install --ignore-scripts --omit=dev


ENV NODE_ENV=PRODUCTION
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=${PORT}

EXPOSE ${PORT}

CMD [ "node", "./.output/server/index.mjs" ]