import { authOptions } from "../auth/[...]"
import { getServerSession } from "#auth"

import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  // auth
  if (!(await getServerSession(event, authOptions))?.user)
    throw new Error("Unauthorized")
  //
  const commands = await readBody<{
    id: number
    add: string[]
    remove: string[]
  }>(event)
  //
  const add = prisma.customPrefilteredDomain.createMany({
    data: commands.add.map((domain_name) => ({
      domain_name,
      custom_prefilter_id: commands.id,
    })),
  })
  const remove = prisma.customPrefilteredDomain.deleteMany({
    where: {
      domain_name: {
        in: commands.remove,
      },
      custom_prefilter_id: commands.id,
    },
  })
  const stamp = prisma.customPrefilter.update({
    where: {
      id: commands.id,
    },
    data: {
      last_updated_timestamp: new Date(),
    },
  })
  return prisma.$transaction([add, remove, stamp])
})
