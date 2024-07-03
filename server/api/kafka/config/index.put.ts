import { Producer } from "kafkajs"
import { ConfigChangeRequest } from "~/types/config"

export default defineEventHandler(async (event) => {
  const TOPIC = "configuration_change_requests"
  const body = await readBody<ConfigChangeRequest>(event)
  const key = body.component
  const value = body.config
  //
  const producer: Producer = event.context.kafka.producer
  await producer.connect()
  await producer.send({
    topic: TOPIC,
    messages: [{ key, value: JSON.stringify(value) }],
  })
  await producer.disconnect()
  //
  return { success: true }
})
