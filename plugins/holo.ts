import Holo from "holo-vue"
import { preferencesPlugin } from '~/stores/preferences'
import type { Pinia } from 'pinia'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Holo)

  const pinia = nuxtApp.$pinia as Pinia
  if (pinia) {
    pinia.use(preferencesPlugin)
  }
})
