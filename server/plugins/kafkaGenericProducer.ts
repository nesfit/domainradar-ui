import { Kafka, Partitioners, Message, Producer } from "kafkajs"
import createKafka from "../utils/kafka"

class KafkaProducer {
  private kafka: Kafka
  private producer: Producer
  private isConnected = false

  // Init methods

  constructor(clientId: string) {
    const runtimeConfig = useRuntimeConfig()
    this.kafka = createKafka(clientId, runtimeConfig.kafkaBroker)
    this.producer = this.kafka.producer({
      allowAutoTopicCreation: false,
      createPartitioner: Partitioners.DefaultPartitioner,
    })
    this.producer.on("producer.connect", () => {
      this.isConnected = true
      console.log("Kafka producer connected.")
    })
    this.producer.on("producer.disconnect", () => {
      this.isConnected = false
      console.log("Kafka producer disconnected.")
    })
  }

  async connect() {
    if (!this.isConnected) {
      await this.producer.connect()
    }
  }

  async disconnect() {
    try {
      await this.producer.disconnect()
    } catch (e) {
      console.error("Failed to disconnect Kafka producer:", e)
    }
  }

  // Send any number of messages to a specified topic.
  async produce(topic: string, messages: Message[]) {
    await this.connect() // short-circuit if already connected
    return await this.producer.send({ topic, messages })
  }

  // Send a single message to a specified topic.
  async produceOne(
    topic: string,
    key: Buffer | string | null,
    value: Buffer | string | null = null,
  ) {
    const message: Message = { key, value }
    return await this.produce(topic, [message])
  }

  async produceFromMapping(
    topic: string,
    messages:
      | Record<string, Buffer | string | null>
      | Map<Buffer | string, Buffer | string | null>,
  ) {
    const entries =
      messages instanceof Map ? Array.from(messages) : Object.entries(messages)
    return await this.produce(
      topic,
      entries.map(([key, value]) => ({ key, value })),
    )
  }

  async produceKeys(topic: string, keys: Array<Buffer | string>) {
    return await this.produce(
      topic,
      keys.map((key) => ({ key, value: null })),
    )
  }
}

async function createProducer() {
  return new KafkaProducer("webui")
}

export default defineNitroPlugin((nitroApp) => {
  createProducer().then((producer) => {
    nitroApp.hooks.hook("request", (event) => {
      event.context.kafkaProducer = producer
    })
    nitroApp.hooks.hook("close", async () => {
      await producer.disconnect()
    })
  })
})

export type { KafkaProducer }
