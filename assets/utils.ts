export function percentFormat(value: number, maximumFractionDigits = 2) {
  return Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: maximumFractionDigits,
  }).format(value)
}

function getValueByPath(obj: Record<string, any>, path: string): any {
  const keys = path.split(".")
  let result = obj
  keys.forEach((key) => {
    result = result[key]
  })
  return result
}

export function groupBy(arr: Record<string, any>[], path: string) {
  return arr.reduce((acc, item) => {
    const group = getValueByPath(item, path)
    acc[group] = acc[group] || []
    acc[group].push(item)
    return acc
  }, {})
}

export function getContinentFromCoordinates(latitude: number, longitude: number): string | null {
  // TODO: This is a very naive implementation. It should be replaced with a more accurate one.
  // Also, Europe and Asia are missing, lol.
  if (
    latitude >= -90 &&
    latitude <= -10 &&
    longitude >= -180 &&
    longitude <= 180
  ) {
    return "Antarctica"
  } else if (
    latitude >= -10 &&
    latitude <= 85 &&
    longitude >= -180 &&
    longitude <= 180
  ) {
    return "Australia"
  } else if (
    latitude >= -10 &&
    latitude <= 85 &&
    longitude >= -25 &&
    longitude <= 60
  ) {
    return "Africa"
  } else if (
    latitude >= -10 &&
    latitude <= 85 &&
    longitude >= -170 &&
    longitude <= -25
  ) {
    return "South America"
  } else if (
    latitude >= -10 &&
    latitude <= 85 &&
    longitude >= -170 &&
    longitude <= -60
  ) {
    return "North America"
  } else if (latitude >= 85 && longitude >= -180 && longitude <= 180) {
    return "Arctic"
  } else {
    return null
  }
}

export function formatCoordinates(latitude: number, longitude: number): string {
  const latitudeDescriptor = latitude >= 0 ? 'N' : 'S'
  const longitudeDescriptor = longitude >= 0 ? 'E' : 'W'
  return `${Math.abs(latitude).toFixed(4)}°${latitudeDescriptor}, ${Math.abs(longitude).toFixed(4)}°${longitudeDescriptor}`
}
