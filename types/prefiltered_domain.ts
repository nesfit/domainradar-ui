export interface PrefilterResult {
  filter_name: string
  evil: boolean
}

export interface PrefilteredDomain {
  _id: {
    domainName: string
    timestamp: Date
  }
  // prefilters: PrefilterResult[]
  [other: string | number | symbol]: unknown
}
