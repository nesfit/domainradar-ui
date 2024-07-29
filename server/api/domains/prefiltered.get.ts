import { parse } from "vue/compiler-sfc"
import { PrefilteredDomainModel } from "~/server/models/prefiltered_domain.schema"
import { PrefilteredDomain } from "~/types/prefiltered_domain"
import { authOptions } from "../auth/[...]"
import { getServerSession } from "#auth"

interface PrefilteredDomainResponse {
  data: PrefilteredDomain[]
  metadata: {
    totalCount: number
    page: number
    limit: number
  }
  error?: any
}

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
    const result = await PrefilteredDomainModel.find({}).exec()
    return {
      data: result,
      metadata: {
        totalCount: result.length,
        page: 1,
        limit: 10,
      },
    }
  },
)
