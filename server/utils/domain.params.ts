import { type H3Event, type EventHandlerRequest, getQuery } from "h3"
import * as Drizzle from "drizzle-orm"
import { type SQL } from "drizzle-orm"
import { Domain } from "~/server/db/schema"

const { asc, desc, ...op } = Drizzle

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
  const filters: SQL[] = []
  //
  if (params.search)
    filters.push(op.ilike(Domain.domain_name, `%${params.search}%`))

  if (params.filterAggregateProbabilityLower)
    filters.push(
      op.gte(
        Domain.aggregate_probability,
        params.filterAggregateProbabilityLower,
      ),
    )

  if (params.filterAggregateProbabilityUpper)
    filters.push(
      op.lte(
        Domain.aggregate_probability,
        params.filterAggregateProbabilityUpper,
      ),
    )

  //
  return op.and(...filters)
}