// @ts-ignore
import { defineMongooseModel } from "#nuxt/mongoose"
import { Schema } from "mongoose"

import type * as Domain from "~/types/domain"

const CollectionResultSchema = new Schema<Domain.CollectionResult>({
  collection_date: Date,
  source: String,
  error: String,
})

const ClassificationResultSchema = new Schema<Domain.ClassificationResult>({
  classification_date: Date,
  classifier: String, // Name of the classifier
  probability: Number,
  description: String,
  details: Object, // Any key: value pair to render in the frontend
})

const QradarOffenseSchema = new Schema<Domain.QradarOffense>({
  id: Number,
  description: String,
  event_count: Number,
  flow_count: Number,
})

//

const IPSchema = new Schema<Domain.IP>({
  ip: String,
  geo: {
    country: String,
    country_code: String,
    region: String,
    region_code: String,
    city: String,
    postal_code: String,
    latitude: Number,
    longitude: Number,
    timezone: String,
    isp: String,
    org: String,
  },
  asn: {
    asn: Number,
    as_org: String,
    network_address: String,
    prefix_len: Number,
  },
  collection_results: [CollectionResultSchema],
  qradar_offense_source: {
    domain_id: Number,
    magnitude: Number,
    offenses: [QradarOffenseSchema],
  },
})

export const DomainModel = defineMongooseModel<Domain.Domain>("Domain", {
  domain_name: String,
  aggregate_probability: Number,
  aggregate_description: String,
  ip_addresses: [IPSchema],
  classification_results: [ClassificationResultSchema],
  first_seen: Date,
  collection_results: [CollectionResultSchema],
  additional_info: Object,
})
