import { authOptions } from "../auth/[...]"
import { getServerSession } from "#auth"

import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  // auth
  if (!(await getServerSession(event, authOptions))?.user)
    throw new Error("Unauthorized")
  //
  return prisma.customPrefilter.findMany({})
})
