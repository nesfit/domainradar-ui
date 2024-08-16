import { authOptions } from "../auth/[...]"
import { getServerSession } from "#auth"
import { getMongoParamsForDomainFromEvent } from "~/server/utils/domain.params"
import { ClassificationResultsModel } from "~/server/models/domain.schema"

interface DomainCountResponse {
  data: {
    totalCount: number
  }
  error?: any
}

export default defineEventHandler(
  async (event): Promise<DomainCountResponse> => {
    // auth
    if (!(await getServerSession(event, authOptions))?.user)
      return {
        data: { totalCount: 0 },
        error: "Unauthorized",
      }
    //
    const { match } = getMongoParamsForDomainFromEvent(event)
    //
    try {
      const totalCount = await ClassificationResultsModel.countDocuments(match)

      return {
        data: { totalCount },
      }
    } catch (error) {
      console.error(error)
      return { data: { totalCount: 0 }, error }
    }
  },
)
