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
    const session = await requireUserSession(event)
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
