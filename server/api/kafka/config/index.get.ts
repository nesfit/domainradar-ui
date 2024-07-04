import type { Admin } from "kafkajs"
import type { ComponentId, Configs } from "~/types/config"
import consume from "~/server/utils/kafkaConsume"

export default defineEventHandler(async (event): Promise<Configs> => {
  const TOPIC = "configuration_states"
  const configs: Configs = {}
  //
  const admin: Admin = event.context.kafka.client.admin()
  const maxOffset = await getTotalOffset(admin, TOPIC)
  let processed = 0
  //
  await consume(
    event.context.kafka.consumer(),
    { topics: [TOPIC] },
    async (message, stop) => {
      const key = message.key?.toString() as ComponentId
      const value = JSON.parse(message.value?.toString() ?? "{}")
      configs[key] = value
      if (++processed === maxOffset) stop()
    },
    { seekToBeginning: true },
  )
  return configs
})

async function getTotalOffset(admin: Admin, topic: string) {
  await admin.connect()
  const offsets = await admin.fetchTopicOffsets(topic)
  const totalOffset = offsets.reduce(
    (acc, { offset }) => acc + parseInt(offset),
    0,
  )
  await admin.disconnect()
  return totalOffset
}
