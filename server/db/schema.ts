import { sql, relations } from "drizzle-orm"
import {
  pgSchema as Schema,
  text,
  serial,
  integer,
  real,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core"

export const publicSchema = Schema("public")

// tables

export const Domain = publicSchema.table("domain", {
  id: serial("id").primaryKey(),
  domain_name: text("domain_name").unique().notNull(),
  aggregate_probability: real("aggregate_probability").notNull(),
  aggregate_description: text("aggregate_description").notNull(),
})

export const IP = publicSchema.table("ip", {
  id: serial("id").primaryKey(),
  ip: text("ip").notNull(),
  geo_country: text("geo_country"),
  geo_country_code: text("geo_country_code"),
  geo_region: text("geo_region"),
  geo_region_code: text("geo_region_code"),
  geo_city: text("geo_city"),
  geo_postal_code: text("geo_postal_code"),
  geo_latitude: real("geo_latitude"),
  geo_longitude: real("geo_longitude"),
  geo_timezone: text("geo_timezone"),
  geo_isp: text("geo_isp"),
  geo_org: text("geo_org"),
  asn: integer("asn"),
  as_org: text("as_org"),
  network_address: text("network_address"),
  network_prefix_length: integer("network_prefix_length"),
  // foreign keys
  domain_id: integer("domain_id").references(() => Domain.id),
})

export const ClassificationCategoryResult = publicSchema.table(
  "classification_category_result",
  {
    id: serial("id").primaryKey(),
    timestamp: timestamp("timestamp"),
    category: text("category").notNull(),
    probability: real("probability").notNull(),
    description: text("description"),
    details: jsonb("details"),
    // foreign keys
    domain_id: integer("domain_id").references(() => Domain.id),
  },
)

export const ClassifierOutput = publicSchema.table("classifier_output", {
  id: serial("id").primaryKey(),
  classifier: text("classifier").notNull(),
  probability: real("probability").notNull(),
  additional_info: text("additional_info"),
  // foreign keys
  category_result_id: integer("category_result_id").references(
    () => ClassificationCategoryResult.id,
  ),
})

export const CollectionResult = publicSchema.table("collection_result", {
  id: serial("id").primaryKey(),
  source: text("source").notNull(),
  status_code: integer("status_code"),
  error: text("error"),
  timestamp: timestamp("timestamp").notNull(),
  raw_data: jsonb("raw_data"),
  // foreign keys
  domain_id: integer("domain_id").references(() => Domain.id),
  ip_id: integer("ip_id").references(() => IP.id),
})

export const QRadarOffenseSource = publicSchema.table("qradar_offense_source", {
  id: serial("id").primaryKey(),
  qradar_domain_id: integer("qradar_domain_id").notNull(),
  magnitude: real("magnitude").notNull(),
  // foreign keys
  ip_id: integer("ip_id").references(() => IP.id),
})

export const QRadarOffense = publicSchema.table("qradar_offense", {
  id: serial("id").primaryKey(),
  description: text("description"),
  event_count: integer("event_count").notNull(),
  flow_count: integer("flow_count").notNull(),
  device_count: integer("device_count"),
  severity: real("severity"),
  magnitude: real("magnitude"),
  last_updated_time: timestamp("last_updated_time"),
  status: text("status"),
  // foreign keys
  source_id: integer("source_id").references(() => QRadarOffenseSource.id),
})

// relations

export const DomainRelations = relations(Domain, ({ many }) => ({
  classification_category_results: many(ClassificationCategoryResult),
  collection_results: many(CollectionResult),
  ip_addresses: many(IP),
}))

export const ClassificationCategoryResultRelations = relations(
  ClassificationCategoryResult,
  ({ one, many }) => ({
    domain: one(Domain),
    classifier_outputs: many(ClassifierOutput),
  }),
)

export const CollectionResultRelations = relations(
  CollectionResult,
  ({ one }) => ({
    domain: one(Domain),
    ip: one(IP),
  }),
)

export const IPRelations = relations(IP, ({ one, many }) => ({
  domain: one(Domain),
  collection_results: many(CollectionResult),
  qradar_offense_source: many(QRadarOffenseSource), // potentially one?
}))

export const QRadarOffenseSourceRelations = relations(
  QRadarOffenseSource,
  ({ one, many }) => ({
    ip: one(IP),
    offenses: many(QRadarOffense),
  }),
)

export const QRadarOffenseRelations = relations(QRadarOffense, ({ one }) => ({
  source: one(QRadarOffenseSource),
}))

export const ClassifierOutputRelations = relations(
  ClassifierOutput,
  ({ one }) => ({
    category_result: one(ClassificationCategoryResult),
  }),
)

//

export const tables = {
  Domain,
  IP,
  ClassificationCategoryResult,
  ClassifierOutput,
  CollectionResult,
  QRadarOffenseSource,
  QRadarOffense,
}
