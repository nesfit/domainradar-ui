import type { Consumer, Message, ConsumerSubscribeTopics, Admin } from "kafkajs"
import type { ComponentId } from "~/types/config"
import { EventEmitter } from "events"

export default defineEventHandler(async (event) => {
  const TOPIC = "configuration_states"
  const configs: Partial<Record<ComponentId, Record<string, any>>> = {}
  //
  const admin: Admin = event.context.kafka.client.admin()
  const maxOffset = await getTotalOffset(admin, TOPIC)
  let processed = 0
  //
  await consume(
    event.context.kafka.consumer,
    { topics: [TOPIC] },
    async (message, stop) => {
      const key = message.key?.toString() as ComponentId
      const value = JSON.parse(message.value?.toString() ?? "{}")
      configs[key] = value
      if (++processed === maxOffset) stop()
    },
    true,
  )
  return configs
})

async function consume(
  consumer: Consumer,
  subscription: ConsumerSubscribeTopics,
  handler: (message: Message, stop: () => void) => Promise<void>,
  seekToBeginning = false, // because fromBeginning is weird
) {
  const bus = new EventEmitter()
  const stop = () => bus.emit("stop")
  try {
    await consumer.connect()
    await consumer.subscribe(subscription)
    await consumer.run({
      eachMessage: async ({ message }) => {
        console.log("emitting message", message)
        bus.emit("message", message)
      },
    })
    if (seekToBeginning) {
      consumer.seek({
        topic: subscription.topics[0].toString(),
        partition: 0,
        offset: "0",
      })
    }
    return new Promise<void>((resolve, reject) => {
      bus.on("message", async (message) => await handler(message, stop))
      bus.on("stop", async () => {
        console.log("stopping consumer by bus")
        await consumer.stop()
        await consumer.disconnect()
        resolve()
      })
    })
  } catch (error) {
    await consumer.disconnect()
    throw error
  }
}

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
