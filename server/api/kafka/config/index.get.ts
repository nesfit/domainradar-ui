import type { Configs } from "~/types/config"
import type { ConfigManager } from "~/server/plugins/configManager"

export default defineEventHandler(async (event): Promise<Configs> => {
  const manager: ConfigManager = event.context.configManager
  return manager.configs
})
