// consume the config topic until the specified component adds a new config state
// or timeout and assume the component is down

import type { ComponentId, Config } from "~/types/config"
import type { ConfigManager } from "~/server/plugins/configManager"

export default defineEventHandler(async (event): Promise<Config> => {
  const componentId = getRouterParam(event, "component") as ComponentId
  const manager: ConfigManager = event.context.configManager
  //
  const configPromise = manager.waitForConfigUpdate(componentId)
  const timeoutPromise = new Promise<Config>((resolve, reject) => {
    setTimeout(() => {
      reject(
        new Error(
          `Timeout waiting for config update for component ${componentId}`,
        ),
      )
    }, 5000) // set the timeout to 5 seconds
  })

  return Promise.race([configPromise, timeoutPromise])
})
