function indexNestedObject(obj: Record<string, any>, path: string): any {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj)
}

/**
 * Takes an array of item objects that have some timestamp and category keys and returns the latest item for each category.
 * @param items - An array of item objects.
 * @param timestampKey - The key of the timestamp in the item object. Can be nested.
 * @param categoryKey - The key of the category in the item object. Can be nested.
 * @returns An array of the latest item for each category.
 */
export default <T>(
  items: T extends Record<string, any>[] ? T : never,
  timestampKey: string,
  categoryKey: string,
) => {
  const latest: Record<string, any> = {}
  for (const item of items) {
    const category = indexNestedObject(item, categoryKey) as string
    const timestamp = indexNestedObject(item, timestampKey)
    const latestTimestamp = indexNestedObject(latest[category], timestampKey)
    if (!latest[category] || timestamp > latestTimestamp) {
      latest[category] = item
    }
  }
  return Object.values(latest) as T
}
