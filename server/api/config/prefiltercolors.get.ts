export default defineEventHandler(async (event) => {
  const storage = useStorage("data:configs")
  const linksConfig: Record<string, string> =
    (await storage.getItem("prefilterColorsConfig")) || {}
  return linksConfig
})
