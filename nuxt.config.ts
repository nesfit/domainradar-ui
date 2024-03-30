import { resolve } from "node:path"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
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
  ],
  css: ["normalize.css/normalize.css"],
  app: {
    pageTransition: {
      name: "page",
      mode: "out-in",
    },
  },
  authJs: {
    authenticatedRedirectTo: "/app",
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
