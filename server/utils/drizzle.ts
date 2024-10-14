import pg from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
export { sql, eq, and, or } from "drizzle-orm"

import * as schema from "../db/schema"

const { Client } = pg
const runtimeConfig = useRuntimeConfig()
const client = new Client(runtimeConfig.db)

export const tables = schema

export function useDrizzle() {
  return drizzle(client, { schema })
}
