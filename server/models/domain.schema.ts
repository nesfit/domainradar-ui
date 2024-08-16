// @ts-ignore
import { defineMongooseModel } from "#nuxt/mongoose"

// quick and dirty stub models
// because using the connection directly is somehow even worse
export const ClassificationResultsModel = defineMongooseModel<{
  domain_name: string
}>(
  "classification_results",
  {
    domain_name: String,
  },
  {
    collection: "classification_results",
  },
)
export const DomainDataModel = defineMongooseModel(
  "dn_data",
  {},
  {
    collection: "dn_data",
  },
)