export default defineEventHandler(async (event) => {
  const storage = useStorage("data:configs")
  const newColors = await readBody(event)
  await storage.setItem("prefilterColorsConfig", { ...newColors })
  return newColors
})
