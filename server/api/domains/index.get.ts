import { authOptions } from "../auth/[...]"
import { getServerSession } from "#auth"

import { useDrizzle } from "~/server/utils/drizzle"
import getDomainParamsFromEvent, {
  buildDomainFilter,
} from "~/server/utils/domain.params"

async function fetchData(params: ReturnType<typeof getDomainParamsFromEvent>) {
  return useDrizzle().query.Domain.findMany({
    with: {
      classification_category_results: {
        with: {
          classifier_outputs: true,
        },
      },
      collection_results: {
        columns: {
          raw_data: false,
        },
      },
      ip_addresses: {
        with: {
          collection_results: true,
          qradar_offense_source: {
            with: {
              offenses: true,
            },
          },
        },
      },
    },
    limit: params.limit,
    offset: params.limit * params.page,
    //
    where: buildDomainFilter(params),
    orderBy: (domain, { asc, desc }) => {
      const sorting = params.sortAsc === 1 ? asc : desc
      // @ts-ignore
      const column = domain[params.sortKey]
      return [sorting(column)]
    },
  })
}

interface DomainResponse {
  data: Awaited<ReturnType<typeof fetchData>>
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
