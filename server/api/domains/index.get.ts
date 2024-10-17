import { authOptions } from "../auth/[...]"
import { getServerSession } from "#auth"

import getDomainParamsFromEvent, {
  buildDomainFilter,
} from "~/server/utils/domain.params"
import prisma from "~/lib/prisma"

async function fetchData(params: ReturnType<typeof getDomainParamsFromEvent>) {
  return prisma.domain.findMany({
    include: {
      ipAddresses: {
        include: {
          collectionResults: {
            include: {
              source: true,
            },
            omit: {
              raw_data: true,
            },
          },
          qradarOffenseSource: {
            include: {
              offenses: true,
            },
          },
        },
      },
      classificationResults: {
        include: {
          classifierOutputs: true,
          category: true,
        },
      },
      collectionResults: {
        include: {
          source: true,
        },
        omit: {
          raw_data: true,
        },
      },
    },
    //
    where: buildDomainFilter(params),
    orderBy: { [params.sortKey]: params.sortAsc === 1 ? "asc" : "desc" },
    skip: (params.page - 1) * params.limit,
    take: params.limit,
  })
}

export type DomainData = Awaited<ReturnType<typeof fetchData>>[0]

interface DomainResponse {
  data: DomainData[]
  metadata: {
    page: number
    limit: number
  }
  error?: any
}

export default defineEventHandler(async (event): Promise<DomainResponse> => {
  // auth
  if (!(await getServerSession(event, authOptions))?.user)
    return {
      data: [],
      metadata: { page: 0, limit: 0 },
      error: "Unauthorized",
    }
  //
  const params = getDomainParamsFromEvent(event)
  const { page, limit } = params
  //
  try {
    return {
      data: await fetchData(params),
      metadata: {
        page,
        limit,
      },
    }
  } catch (error) {
    console.error(error)
    return { data: [], metadata: { page, limit }, error }
  }
})
