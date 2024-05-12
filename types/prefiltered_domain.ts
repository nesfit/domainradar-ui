export interface PrefilterResult {
  filter_name: string
  evil: boolean
}

export interface PrefilteredDomain {
  domain_name: string
  prefilters: PrefilterResult[]
}
