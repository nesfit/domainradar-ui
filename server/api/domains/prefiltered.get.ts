import { authOptions } from "../auth/[...]"
import { getServerSession } from "#auth"

interface PrefilteredDomainResponse {
  data: Record<string, any>[]
  metadata: {
    totalCount: number
    page: number
    limit: number
  }
  error?: any
}

// TODO implement with postgres
export default defineEventHandler(
  async (event): Promise<PrefilteredDomainResponse> => {
    // auth
    if (!(await getServerSession(event, authOptions))?.user)
      return {
        data: [],
        metadata: { totalCount: 0, page: 0, limit: 0 },
        error: "Unauthorized",
      }
    //
    return {
      data: [],
      metadata: {
        totalCount: 0,
        page: 1,
        limit: 10,
      },
      error: "pg version not implemented!",
    }
  },
)
