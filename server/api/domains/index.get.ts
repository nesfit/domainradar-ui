import type { TypedSql } from "@prisma/client/runtime/library"
import { authOptions } from "../auth/[...]"
import { getServerSession } from "#auth"

import getDomainParamsFromEvent, {
  buildDomainFilter,
  buildDomainSort,
} from "~/server/utils/domain.params"
import prisma from "~/lib/prisma"

// workaround queries
import { getDomainsSortedByCategoryProbability } from "@prisma/client/sql"
import { Prisma } from "@prisma/client"

function neededWorkaroundFn(params: DomainParams): workaroundFn | null {
  // sort by category probability
  if (params.sortKey === "phishing_probability")
    return (...args: Parameters<workaroundFn>) =>
      getDomainsSortedByCategoryProbability("Phishing", ...args)
  if (params.sortKey === "malware_probability")
    return (...args: Parameters<workaroundFn>) =>
      getDomainsSortedByCategoryProbability("Malware", ...args)
  if (params.sortKey === "dga_probability")
    return (...args: Parameters<workaroundFn>) =>
      getDomainsSortedByCategoryProbability("DGA", ...args)
  // none needed
  return null
}

type DomainParams = ReturnType<typeof getDomainParamsFromEvent>
type workaroundFn = (
  offset: number,
  limit: number,
  minProbability: number,
  maxProbability: number,
  domainNameContaining: string,
) => TypedSql<any, { id: bigint }>

async function executeWorkaroundQuery(
  workaround: workaroundFn,
  params: DomainParams,
) {
  const {
    offset,
    limit,
    filterAggregateProbabilityLower,
    filterAggregateProbabilityUpper,
    search,
  } = params
  //
  return prisma.$queryRawTyped(
    workaround(
      offset,
      limit,
      filterAggregateProbabilityLower,
      filterAggregateProbabilityUpper,
      search,
    ),
  )
}

async function executeFindManyQuery(
  params: DomainParams,
  idsFromWorkaround: number[] = [],
) {
  const usingWorkaround = idsFromWorkaround.length > 0
  const result = await prisma.domain.findMany({
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
    where: usingWorkaround
      ? { id: { in: idsFromWorkaround } }
      : buildDomainFilter(params),
    orderBy: usingWorkaround
      ? {}
      : buildDomainSort(params.sortKey, params.sortAsc === 1),
    skip: usingWorkaround ? 0 : (params.page - 1) * params.limit,
    take: usingWorkaround ? idsFromWorkaround.length : params.limit,
  })
  // re-sort if using workaround
  if (usingWorkaround) {
    return result.sort(
      (a, b) =>
        idsFromWorkaround.indexOf(a.id) - idsFromWorkaround.indexOf(b.id),
    )
  }
  //
  return result
}

async function fetchData(params: DomainParams) {
  const workaroundFn = neededWorkaroundFn(params)
  if (workaroundFn) {
    const domainsWithIds = await executeWorkaroundQuery(workaroundFn, params)
    const ids = domainsWithIds.map((d) => Number(d.id))
    return executeFindManyQuery(params, ids)
  }
  return executeFindManyQuery(params)
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
