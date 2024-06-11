import type { DateTimeFormat } from "@intlify/core"

const universalDateTimeFormat: DateTimeFormat = {
  short: {
    year: "numeric",
    month: "short",
    day: "numeric",
  },
  long: {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  },
}

export default defineI18nConfig(() => ({
  legacy: false,
  locale: "cs",
  fallbackLocale: "en",
  datetimeFormats: {
    cs: universalDateTimeFormat,
    en: universalDateTimeFormat,
  },
}))
