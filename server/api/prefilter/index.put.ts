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
  const isNew = !options.id
  //
  if (isNew) {
    return prisma.customPrefilter.create({
      data: {
        name: options.name || "",
        description: options.description || "",
        enabled: options.enabled,
        action: options.action,
      },
    })
  } else {
    return prisma.customPrefilter.update({
      where: {
        id: options.id,
      },
      data: options,
    })
  }
})
