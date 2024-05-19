import { resolve } from "node:path"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  alias: {
    cookie: resolve(__dirname, "node_modules/cookie"),
    "nuxt-mdi": resolve(__dirname, "node_modules/nuxt-mdi"),
  },
  modules: [
    "@pinia/nuxt",
    "@nuxtjs/tailwindcss",
    "@vueuse/nuxt",
    "nuxt-mdi",
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
    pageTransition: {
      name: "page",
      mode: "out-in",
    },
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
    authJs: {
      secret: process.env.NUXT_NEXTAUTH_SECRET,
    },
    public: {
      authJs: {
        baseUrl: process.env.NUXT_NEXTAUTH_URL,
        verifyClientOnEveryRequest: true,
      },
    },
  },
})