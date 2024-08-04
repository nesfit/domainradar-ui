import { parse } from "vue/compiler-sfc"
import { Domain } from "~/types/domain"
import { authOptions } from "../auth/[...]"
import { getServerSession } from "#auth"
import createDomainPipeline from "~/server/utils/domain.pipeline"
import { defineMongooseModel } from "#nuxt/mongoose"

interface DomainResponse {
  data: Domain[]
  metadata: {
    totalCount: number
    page: number
    limit: number
  }
  error?: any
}

// quick and dirty stub models
// because using the connection directly is somehow even worse
const ClassificationResultsModel = defineMongooseModel<{ domain_name: string }>(
  "classification_results",
  {
    domain_name: String,
  },
  {
    collection: "classification_results",
  },
)
const DomainDataModel = defineMongooseModel(
  "dn_data",
  {},
  {
    collection: "dn_data",
  },
)

export default defineEventHandler(async (event): Promise<DomainResponse> => {
  // auth
  if (!(await getServerSession(event, authOptions))?.user)
    return {
      data: [],
      metadata: { totalCount: 0, page: 0, limit: 0 },
      error: "Unauthorized",
    }
  //
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
  if (isNaN(filterAggregateProbabilityLower))
    filterAggregateProbabilityLower = 0
  if (isNaN(filterAggregateProbabilityUpper))
    filterAggregateProbabilityUpper = 1
  //
  try {
    const match = {
      aggregate_probability: {
        $gte: filterAggregateProbabilityLower,
        $lte: filterAggregateProbabilityUpper,
      },
      domain_name: { $regex: search, $options: "i" },
    }

    const domainNamesPagePromise = ClassificationResultsModel.find(match, {
      _id: 0,
      domain_name: 1,
    })
      .sort({ [sortKey]: sortAsc as 1 | -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec()
    const totalCountPromise =
      ClassificationResultsModel.countDocuments(match).exec()

    const [domainNamesPage, totalCount] = await Promise.all([
      domainNamesPagePromise,
      totalCountPromise,
    ])
    const domainNamesToAggregate = domainNamesPage.map(
      (domain) => domain.domain_name,
    )

    const pipeline = createDomainPipeline(domainNamesToAggregate)
    const result = await DomainDataModel.aggregate(pipeline)

    return {
      data: result,
      metadata: {
        totalCount,
        page,
        limit,
      },
    }
  } catch (error) {
    console.error(error)
    return { data: [], metadata: { totalCount: 0, page, limit }, error }
  }
})
