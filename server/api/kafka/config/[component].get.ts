// consume the config topic until the specified component adds a new config state
// or timeout and assume the component is down

import type { ComponentId, Config } from "~/types/config"
import consume from "~/server/utils/kafkaConsume"

export default defineEventHandler(async (event): Promise<Config> => {
  const TOPIC = "configuration_states"
  const componentId = getRouterParam(event, "component") as ComponentId
  let config: Config | undefined
  //
  await consume(
    event.context.kafka.consumer,
    { topics: [TOPIC] },
    async (message, stop) => {
      const key = message.key?.toString() as ComponentId
      if (key === componentId) {
        config = JSON.parse(message.value?.toString() ?? "{}")
        stop()
      }
    },
    { timeout: 5000 },
  )
  return config ?? {}
})
