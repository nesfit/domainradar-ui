import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  // auth
  const session = await requireUserSession(event)
  //
  return prisma.customPrefilter.findMany({})
})
