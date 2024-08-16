import { type H3Event, type EventHandlerRequest, getQuery } from "h3"

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

export function getMongoParamsForDomainFromEvent(
  event: H3Event<EventHandlerRequest>,
) {
  const {
    page,
    limit,
    search,
    sortAsc,
    sortKey,
    filterAggregateProbabilityLower,
    filterAggregateProbabilityUpper,
  } = getDomainParamsFromEvent(event)
  return {
    match: {
      aggregate_probability: {
        $gte: filterAggregateProbabilityLower,
        $lte: filterAggregateProbabilityUpper,
      },
      domain_name: { $regex: search, $options: "i" },
    },
    sort: { [sortKey]: sortAsc as 1 | -1 },
    skip: (page - 1) * limit,
    limit,
    page,
  }
}
