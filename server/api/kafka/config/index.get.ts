import type { Configs } from "~/types/config"
import type { ConfigManager } from "~/server/plugins/configManager"

export default defineEventHandler(async (event): Promise<Configs> => {
  const manager: ConfigManager = event.context.configManager
  if (!manager) {
    console.error("No config manager found in context!")
    console.log(event.context)
    return {}
  }
  return manager.configs
})
