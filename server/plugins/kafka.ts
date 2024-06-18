import { Kafka, Partitioners } from "kafkajs"

async function createKafka() {
  const runtimeConfig = useRuntimeConfig()
  const storage = useStorage("assets:server")

  const ca = await storage.getItem("kafka-ssl/ca-cert.pem")
  const cert = await storage.getItem("kafka-ssl/webui-cert.pem")
  const key = await storage.getItem("kafka-ssl/webui-priv-key.pem")

  const kafka = new Kafka({
    clientId: "nitro",
    brokers: [runtimeConfig.kafkaBroker],
    ssl: {
      rejectUnauthorized: false,
      ca: ca?.toString(),
      cert: cert?.toString(),
      key: key?.toString(),
    },
  })

  const producer = kafka.producer({
    allowAutoTopicCreation: false,
    createPartitioner: Partitioners.DefaultPartitioner,
  })
  const consumer = kafka.consumer({ groupId: "webui" })

  return { client: kafka, producer, consumer }
}

export default defineNitroPlugin((nitroApp) => {
  createKafka().then((kafka) => {
    nitroApp.hooks.hook("request", (event) => {
      event.context.kafka = kafka
    })
  })
})
