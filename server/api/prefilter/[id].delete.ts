import { authOptions } from "../auth/[...]"
import { getServerSession } from "#auth"

import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  // auth
  if (!(await getServerSession(event, authOptions))?.user)
    throw new Error("Unauthorized")
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
