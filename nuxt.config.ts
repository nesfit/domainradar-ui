import { resolve } from "node:path"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  alias: {
    cookie: resolve(__dirname, "node_modules/cookie"),
  },
  modules: [
    "@pinia/nuxt",
    "@nuxtjs/tailwindcss",
    "@vueuse/nuxt",
    "nuxt-mdi-unfucked",
    "nuxt-mongoose",
    "@hebilicious/authjs-nuxt",
    "@nuxtjs/i18n",
    "floating-vue/nuxt",
  ],
  css: [
    "normalize.css/normalize.css",
    "holo-vue/dist/style.css",
    "~/assets/main.css",
  ],
  app: {
    // pageTransition: {
    //   name: "page",
    //   mode: "out-in",
    // },
  },
  mongoose: {
    uri: process.env.NUXT_MONGOOSE_URI,
  },
  authJs: {
    authenticatedRedirectTo: "/app",
  },
  i18n: {
    defaultLocale: "en",
    strategy: "no_prefix",
    lazy: true,
    langDir: "locales",
    locales: [
      { code: "en", iso: "en-US", file: "en.yaml" },
      { code: "cs", iso: "cs-CZ", file: "cs.yaml" },
    ],
  },
  runtimeConfig: {
    kafkaBroker: process.env.NUXT_KAFKA_BROKER,
    mongoose: { uri: process.env.NUXT_MONGOOSE_URI },
    authJs: {
      secret: "",
    },
    public: {
      authJs: {
        verifyClientOnEveryRequest: true,
      },
    },
  },
})