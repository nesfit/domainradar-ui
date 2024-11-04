import { authOptions } from "../auth/[...]"
import { getServerSession } from "#auth"
import prisma from "~/lib/prisma"
import type { Prisma } from "@prisma/client"

export type Data = Prisma.PromiseReturnType<typeof prisma.domainsInput.findMany>

interface PrefilteredDomainResponse {
  data: Data
  metadata: {
    totalCount: number
    page: number
    limit: number
  }
  error?: any
}

export default defineEventHandler(
  async (event): Promise<PrefilteredDomainResponse> => {
    // auth
    if (!(await getServerSession(event, authOptions))?.user)
      return {
        data: [],
        metadata: { totalCount: 0, page: 0, limit: 0 },
        error: "Unauthorized",
      }
    //
    return {
      data: await prisma.domainsInput.findMany({
        take: 1000,
        where: {
          filter_output: {
            not: {}, // don't show unfiltred domains
          },
        },
      }),
      metadata: {
        totalCount: 0,
        page: 1,
        limit: 10,
      },
    }
  },
)
