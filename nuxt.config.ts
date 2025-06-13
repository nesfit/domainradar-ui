import { resolve } from "node:path"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  alias: {
    cookie: resolve(__dirname, "node_modules/cookie"),
  },
  modules: [
    "@prisma/nuxt",
    "@pinia/nuxt",
    "@nuxtjs/tailwindcss",
    "@vueuse/nuxt",
    "nuxt-mdi-unfucked",
    "@nuxtjs/i18n",
    "floating-vue/nuxt",
    "nuxt-jsoneditor",
    "nuxt-auth-utils",
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
  prisma: {
    runMigration: false,
    generateClient: false,
    autoSetupPrisma: true,
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
  jsoneditor: {
    componentName: "JsonEditor",
    includeCss: true,
    options: {
      /**
       *
       * SET GLOBAL OPTIONS
       *
       * */
    },
  },
  runtimeConfig: {
    sessionPassword: process.env.NUXT_SESSION_PASSWORD || '',
    kafkaBroker: process.env.NUXT_KAFKA_BROKER,
    kafkaGroupId: process.env.NUXT_KAFKA_GROUP_ID,
    db: {
      connectionString: process.env.NUXT_DB_CONNECTION_STRING,
    },
    public: {
      qradarBaseUrl: "http://qradar.base.not.set",
    },
  },
  vite: {
    resolve: {
      alias: {
        ".prisma/client/index-browser":
          "./node_modules/.prisma/client/index-browser.js",
      },
    },
  },
})