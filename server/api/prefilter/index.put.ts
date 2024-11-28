import { authOptions } from "../auth/[...]"
import { getServerSession } from "#auth"

import prisma from "~/lib/prisma"

export type CustomPrefilter = {
  id?: number
  name?: string
  description?: string | null
  enabled?: boolean
  action?: number
}

export default defineEventHandler(async (event) => {
  // auth
  if (!(await getServerSession(event, authOptions))?.user)
    throw new Error("Unauthorized")
  //
  const options = await readBody<CustomPrefilter>(event)
  //
  return prisma.customPrefilter.upsert({
    where: {
      id: options.id,
    },
    update: options,
    create: {
      name: options.name || "",
      description: options.description || "",
      enabled: options.enabled,
      action: options.action,
    },
  })
})
