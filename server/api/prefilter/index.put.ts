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
  const session = await requireUserSession(event)
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
      data: {
        ...options,
        last_updated_timestamp: new Date(),
      },
    })
  }
})
