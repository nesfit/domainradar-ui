import type { KafkaProducer } from "~/server/plugins/kafkaGenericProducer"

export default defineEventHandler(async (event) => {
  // auth
  const session = await requireUserSession(event)
  //
  const request = await readBody<string[]>(event)
  const producer: KafkaProducer = event.context.kafkaProducer
  await producer.produceKeys("to_process_zone", request)
  //
  return { success: true }
})
