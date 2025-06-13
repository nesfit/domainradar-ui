import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  // auth
  const session = await requireUserSession(event)
  //
  const id = getRouterParam(event, "id")
  if (!id) throw new Error("id is required")
  const prefilterId = parseInt(id)
  //
  return prisma.customPrefilter.findFirst({
    where: {
      id: prefilterId,
    },
    include: {
      domains: {
        omit: {
          custom_prefilter_id: true,
        },
      },
    },
  })
})
