import { authOptions } from "../auth/[...]"
import { getServerSession } from "#auth"

import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  // auth
  if (!(await getServerSession(event, authOptions))?.user)
    throw new Error("Unauthorized")
  //
  const id = getQuery<{ id: number }>(event).id
  //
  const domainsDelete = prisma.customPrefilteredDomain.deleteMany({
    where: {
      custom_prefilter_id: id,
    },
  })
  const prefilterDelete = prisma.customPrefilter.delete({
    where: {
      id,
    },
  })
  return prisma.$transaction([domainsDelete, prefilterDelete])
})
