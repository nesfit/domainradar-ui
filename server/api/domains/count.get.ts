import getDomainParamsFromEvent, {
  buildDomainFilter,
} from "~/server/utils/domain.params"
import prisma from "~/lib/prisma"

interface DomainCountResponse {
  data: {
    totalCount: number
  }
  error?: any
}

export default defineEventHandler(
  async (event): Promise<DomainCountResponse> => {
    // auth
    const session = await requireUserSession(event)
    //
    //
    try {
      const totalCount = await prisma.domain.count({
        where: buildDomainFilter(getDomainParamsFromEvent(event)),
      })

      return {
        data: { totalCount },
      }
    } catch (error) {
      console.error(error)
      return { data: { totalCount: 0 }, error }
    }
  },
)
