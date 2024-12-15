import { authOptions } from "../auth/[...]"
import { getServerSession } from "#auth"

import getDomainParamsFromEvent from "~/server/utils/domain.params"
import prisma from "~/lib/prisma"
import { countResults } from "@prisma/client/sql"

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
    //
    try {
      const {
        filterAggregateProbabilityLower,
        filterAggregateProbabilityUpper,
        search,
      } = getDomainParamsFromEvent(event)
      const countResult = await prisma.$queryRawTyped(
        countResults(
          filterAggregateProbabilityLower,
          filterAggregateProbabilityUpper,
          search,
        ),
      )
      const totalCount = Number(countResult[0].estimate) || 0

      return {
        data: { totalCount },
      }
    } catch (error) {
      console.error(error)
      return { data: { totalCount: 0 }, error }
    }
  },
)
