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
    "@hebilicious/authjs-nuxt",
    "@nuxtjs/i18n",
    "floating-vue/nuxt",
    "nuxt-jsoneditor",
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
    kafkaBroker: process.env.NUXT_KAFKA_BROKER,
    kafkaGroupId: process.env.NUXT_KAFKA_GROUP_ID,
    db: {
      connectionString: process.env.NUXT_DB_CONNECTION_STRING,
    },
    authJs: {
      secret: "",
    },
    public: {
      authJs: {
        verifyClientOnEveryRequest: true,
      },
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