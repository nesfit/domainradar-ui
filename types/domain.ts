export enum CollectionSource {
  DNS = "DNS",
  RDAP = "RDAP",
  TLS = "TLS",
  Geo = "Geo",
  ASN = "ASN",
  ICMP = "ICMP",
}

export interface CollectionResult {
  collection_date: Date
  source: CollectionSource
  error?: string
}

export interface ClassificationResult {
  classification_date?: Date
  classifier: string
  probability: number
  description?: string
  details?: Record<string, string>
}

export interface QradarOffense {
  id: number
  description: string
  event_count: number
  flow_count: number
}

//

export interface IP {
  ip: string
  geo?: {
    country: string
    country_code?: string
    region?: string
    region_code?: string
    city?: string
    postal_code?: string
    latitude?: number
    longitude?: number
    timezone?: string
    isp?: string
    org?: string
  }
  asn?: {
    asn: number
    as_org: string
    network_address: string
    prefix_len: number
  }
  collection_results: CollectionResult[]
  qradar_offense_source?: {
    domain_id: number
    magnitude: number
    offenses: QradarOffense[]
  }
}

export interface Domain {
  domain_name: string
  aggregate_probability: number
  aggregate_description: string
  ip_addresses: IP[]
  classification_results: ClassificationResult[]
  first_seen: Date
  last_seen: Date
  collection_results: CollectionResult[]
  additional_info?: Record<string, any>
}
