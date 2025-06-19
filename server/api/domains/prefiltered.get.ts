import prisma from "~/lib/prisma"
import type { Prisma } from "@prisma/client"
import { getQuery } from "h3"

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
    // parse query params
    const { page = 1, limit = 20, search = "" } = getQuery(event)
    const pageNum = Math.max(1, parseInt(page as string) || 1)
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string) || 20))
    const searchStr = (search as string) || ""
    //
    const where: Prisma.DomainsInputWhereInput = {
      filter_output: { not: {} },
      ...(searchStr ? { domain: { contains: searchStr } } : {}),
    }
    //
    const [totalCount, data] = await Promise.all([
      prisma.domainsInput.count({ where }),
      prisma.domainsInput.findMany({
        where,
        orderBy: { last_seen: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
    ])
    return {
      data,
      metadata: {
        totalCount,
        page: pageNum,
        limit: limitNum,
      },
    }
  },
)
