import { ConfigChangeRequest } from "~/types/config"
import type { ConfigManager } from "~/server/plugins/configManager"

export default defineEventHandler(async (event) => {
  const request = await readBody<ConfigChangeRequest>(event)
  const manager: ConfigManager = event.context.configManager
  await manager.updateConfig(request)
  //
  return { success: true }
})
