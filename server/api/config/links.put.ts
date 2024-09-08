export default defineEventHandler(async (event) => {
  const storage = useStorage("data:configs")
  const newLinks = await readBody(event)
  await storage.setItem("linksConfig", { ...newLinks })
  return newLinks
})
