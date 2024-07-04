import { Kafka, Partitioners } from "kafkajs"
import fs from "fs/promises"

async function getContent(path: string) {
  try {
    return await fs.readFile(path, { encoding: "utf-8" })
  } catch (e) {
    return null
  }
}

async function createKafka() {
  const runtimeConfig = useRuntimeConfig()

  const ca = await getContent("kafka-ssl/ca-cert.pem")
  const cert = await getContent("kafka-ssl/webui-cert.pem")
  const key = await getContent("kafka-ssl/webui-priv-key.pem")
  const passphrase = await getContent("kafka-ssl/key-password.txt")

  const kafka = new Kafka({
    clientId: "nitro",
    brokers: [runtimeConfig.kafkaBroker],
    ssl: {
      rejectUnauthorized: false,
      ca: ca?.toString().trim(),
      cert: cert?.toString().trim(),
      key: key?.toString().trim(),
      passphrase: passphrase?.toString().trim(),
    },
  })

  const producer = () =>
    kafka.producer({
      allowAutoTopicCreation: false,
      createPartitioner: Partitioners.DefaultPartitioner,
    })
  const consumer = () => kafka.consumer({ groupId: "webui" })

  return { client: kafka, producer, consumer }
}

export default defineNitroPlugin((nitroApp) => {
  createKafka().then((kafka) => {
    nitroApp.hooks.hook("request", (event) => {
      event.context.kafka = kafka
    })
  })
})
