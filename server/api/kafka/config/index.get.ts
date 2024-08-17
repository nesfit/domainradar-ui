import type { Configs } from "~/types/config"
import type { ConfigManager } from "~/server/plugins/configManager"

export default defineEventHandler(async (event): Promise<Configs> => {
  const manager: ConfigManager = event.context.configManager
  if (!manager) {
    throw new Error("No config manager in context yet.")
  }
  return manager.configs
})
