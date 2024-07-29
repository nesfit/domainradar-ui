// @ts-ignore
import { defineMongooseModel } from "#nuxt/mongoose"
import { Schema } from "mongoose"

import { PrefilteredDomain } from "~/types/prefiltered_domain"

export const PrefilteredDomainModel = defineMongooseModel<PrefilteredDomain>(
  "PrefilteredDomain",
  {
    _id: {
      domainName: String,
      timestamp: Date,
    },
  },
  {
    collection: "filtered_domains",
  },
)
