import fs from "fs"
import { Kafka } from "kafkajs"

function getContent(path: string) {
  try {
    const content = fs.readFileSync(path, { encoding: "utf-8" })
    return content.toString().trim()
  } catch (e) {
    return ""
  }
}

export default function createKafka(
  clientId: string,
  brokers: string | string[],
) {
  return new Kafka({
    clientId,
    brokers: Array.isArray(brokers) ? brokers : [brokers],
    ssl: {
      rejectUnauthorized: false,
      ca: getContent("kafka-ssl/ca-cert.pem"),
      cert: getContent("kafka-ssl/webui-cert.pem"),
      key: getContent("kafka-ssl/webui-priv-key.pem"),
      passphrase: getContent("kafka-ssl/key-password.txt"),
    },
  })
}
