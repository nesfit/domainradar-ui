import { authOptions } from "../auth/[...]"
import { getServerSession } from "#auth"

import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  // auth
  if (!(await getServerSession(event, authOptions))?.user)
    return {
      data: [],
      metadata: { page: 0, limit: 0 },
      error: "Unauthorized",
    }
  //
  return prisma.customPrefilter.findMany({})
})
