import { type Domain } from "~/types/domain"
import { authOptions } from "../auth/[...]"
import { getServerSession } from "#auth"
import createDomainPipeline from "~/server/utils/domain.pipeline"
import { getMongoParamsForDomainFromEvent } from "~/server/utils/domain.params"
import {
  ClassificationResultsModel,
  DomainDataModel,
} from "~/server/models/domain.schema"

interface DomainResponse {
  data: Domain[]
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
  const { match, sort, skip, limit, page } =
    getMongoParamsForDomainFromEvent(event)
  //
  try {
    const domainNamesPage = await ClassificationResultsModel.find(match, {
      _id: 0,
    })
      .sort(sort)
      .skip(skip)
      .limit(limit)

    const domainNamesToAggregate = domainNamesPage.map(
      (domain) => domain.domain_name,
    )

    const pipeline = createDomainPipeline(domainNamesToAggregate)
    const result = await DomainDataModel.aggregate(pipeline)

    const combined = domainNamesPage.map((domain) => {
      const domainData = result.find(
        (d) => d.domain_name === domain.domain_name,
      )
      if (!domainData) {
        return {
          ...domain.toObject(),
          ip_addresses: [],
          first_seen: null,
        }
      } else {
        return domainData
      }
    })

    return {
      data: combined,
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
