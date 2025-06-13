import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  // auth
  const session = await requireUserSession(event)
  //
  const id = getRouterParam(event, "id")
  if (!id) throw new Error("id is required")
  const prefilterId = parseInt(id)
  //
  const domainsDelete = prisma.customPrefilteredDomain.deleteMany({
    where: {
      custom_prefilter_id: prefilterId,
    },
  })
  const prefilterDelete = prisma.customPrefilter.delete({
    where: {
      id: prefilterId,
    },
  })
  return prisma.$transaction([domainsDelete, prefilterDelete])
})
