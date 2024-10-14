import { type H3Event, type EventHandlerRequest, getQuery } from "h3"
import type { Prisma } from "@prisma/client"

export default function getDomainParamsFromEvent(
  event: H3Event<EventHandlerRequest>,
) {
  let {
    page,
    limit,
    search,
    sortAsc,
    sortKey,
    filterAggregateProbabilityLower,
    filterAggregateProbabilityUpper,
    filterHighestClassifier,
  } = getQuery(event)
  // PARSE
  page = parseInt((page as string) ?? 1)
  limit = parseInt((limit as string) ?? 20)
  search = (search as string) ?? ""
  sortAsc = sortAsc === "true" ? 1 : -1
  sortKey = (sortKey as string) ?? "aggregate_probability"
  filterAggregateProbabilityLower =
    parseFloat(filterAggregateProbabilityLower as string) / 100
  filterAggregateProbabilityUpper =
    parseFloat(filterAggregateProbabilityUpper as string) / 100
  filterHighestClassifier = (filterHighestClassifier as string) ?? ""
  // HANDLE INVALID
  if (isNaN(filterAggregateProbabilityLower))
    filterAggregateProbabilityLower = 0
  if (isNaN(filterAggregateProbabilityUpper))
    filterAggregateProbabilityUpper = 1
  // RETURN
  return {
    page,
    limit,
    search,
    sortAsc,
    sortKey,
    filterAggregateProbabilityLower,
    filterAggregateProbabilityUpper,
    filterHighestClassifier,
  }
}

export function buildDomainFilter(
  params: ReturnType<typeof getDomainParamsFromEvent>,
) {
  const filters: Prisma.DomainWhereInput[] = []
  //
  if (params.search) filters.push({ domain_name: { contains: params.search } })

  if (params.filterAggregateProbabilityLower)
    filters.push({
      aggregate_probability: { gte: params.filterAggregateProbabilityLower },
    })

  if (params.filterAggregateProbabilityUpper)
    filters.push({
      aggregate_probability: { lte: params.filterAggregateProbabilityUpper },
    })

  //
  return { AND: filters }
}
