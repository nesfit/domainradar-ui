import { parse } from "vue/compiler-sfc"
import { Domain } from "~/types/domain"

interface DomainResponse {
  data: Domain[]
  metadata: {
    totalCount: number
    page: number
    limit: number
  }
  error?: any
}

export default defineEventHandler(async (event): Promise<DomainResponse> => {
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
  //
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
  //
  try {
    const match = {
      aggregate_probability: {
        $gte: filterAggregateProbabilityLower,
        $lte: filterAggregateProbabilityUpper,
      },
      domain_name: { $regex: search, $options: "i" },
    }
    const result = await DomainModel.aggregate([
      {
        $facet: {
          metadata: [{ $match: match }, { $count: "totalCount" }],
          data: [
            {
              $match: match,
            },
            {
              $addFields: {
                offense_count: {
                  $size: {
                    $reduce: {
                      input: "$ip_addresses.qradar_offense_source.offenses",
                      initialValue: [],
                      in: { $concatArrays: ["$$value", "$$this"] },
                    },
                  },
                },
              },
            },
            { $sort: { [sortKey]: sortAsc as 1 | -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
          ],
        },
      },
    ])
    return {
      data: result[0].data,
      metadata: {
        totalCount: result[0].metadata[0].totalCount,
        page,
        limit,
      },
    }
  } catch (error) {
    return { data: [], metadata: { totalCount: 0, page, limit }, error }
  }
})
