import { Consumer, ConsumerSubscribeTopics, Message } from "kafkajs"
import { EventEmitter } from "events"

type ConsumeOptions = {
  /** Whether to seek to the beginning of the topic. */
  seekToBeginning?: boolean
  /** Timeout in ms after which the consumer will stop and this will throw. */
  timeout?: number
}

function readOptions(options: ConsumeOptions): Required<ConsumeOptions> {
  const { seekToBeginning = false, timeout = 0 } = options
  return { seekToBeginning, timeout }
}

/**
 * Consume messages from Kafka.
 * @param consumer The Kafka consumer.
 * @param subscription The topics to subscribe to.
 * @param handler The message handler function.
 * @param options Additional options.
 * @returns A promise that resolves when the consumer stops.
 * @throws If the consumer fails to connect or subscribe.
 *
 * The handler is provided with the message and a stop function.
 * The stop function can be called to stop the consumer if the
 * handler determines that it the task at hand is complete.
 */
export default async function consume(
  consumer: Consumer,
  subscription: ConsumerSubscribeTopics,
  handler: (message: Message, stop: () => void) => Promise<void>,
  options: ConsumeOptions = {},
) {
  const { seekToBeginning, timeout } = readOptions(options)
  const bus = new EventEmitter()
  const stop = () => bus.emit("stop")
  if (timeout > 0) {
    setTimeout(() => {
      bus.emit("stop")
      throw new Error("timeout")
    }, timeout)
  }
  try {
    await consumer.connect()
    await consumer.subscribe(subscription)
    await consumer.run({
      eachMessage: async ({ message }) => {
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
