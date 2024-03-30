// @ts-ignore
import { defineMongooseModel } from "#nuxt/mongoose"
import { Schema } from "mongoose"

import type * as DR from "~/types/dr"

const PrefilterResultSchema = new Schema<DR.PrefilterResult>({
  filter: String,
  // TODO
})

const CollectionResultSchema = new Schema<DR.CollectionResult>({
  collection_date: Date,
  source: String,
  result: String,
  error: String,
  attempts: [Object], // What was this, again?
})

const ClassificationResultSchema = new Schema<DR.ClassificationResult>({
  classification_date: Date,
  classifier: String, // Name of the classifier
  probability: Number,
  description: String,
  details: Object, // Any key: value pair to render in the frontend
})

const QradarOffenseSchema = new Schema<DR.QradarOffense>({
  id: Number,
  qradar_domain: String,
  event_flow_count: Number,
  magnitude: Number,
})

//

const IPSchema = new Schema<DR.IP>({
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
  qradar_offenses: [QradarOffenseSchema],
})

export const DomainModel = defineMongooseModel<DR.Domain>("Domain", {
  domain_name: String,
  aggregate_probability: Number,
  aggregate_description: String,
  ip_addresses: [IPSchema],
  classification_results: [ClassificationResultSchema],
  first_seen: Date,
  last_seen: Date,
  collection_results: [CollectionResultSchema],
  prefilter_results: [PrefilterResultSchema],
  nějaký_misp: Object, // TODO
  additional_info: Object,
})
