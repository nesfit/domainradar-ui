export enum Component {
  LOADER = "loader",
  COLLECTOR_ZONE = "collector-zone",
  COLLECTOR_DNS = "collector-dns",
  COLLECTOR_TLS = "collector-tls",
  COLLECTOR_NERD = "collector-nerd",
  COLLECTOR_GEOIP = "collector-geoip",
  COLLECTOR_RDAP_DN = "collector-rdap-dn",
  COLLECTOR_RDAP_IP = "collector-rdap-ip",
  COLLECTOR_RTT = "collector-rtt",
  MERGER = "merger",
  EXTRACTOR = "extractor",
  CLASSIFIER_UNIT = "classifier-unit",
}

export type ComponentId = `${Component}`
