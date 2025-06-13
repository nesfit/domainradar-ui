import { Kafka, Partitioners, Message, Consumer } from "kafkajs"
import type {
  ComponentId,
  Configs,
  Config,
  ConfigChangeRequest,
} from "~/types/config"
import createKafka from "../utils/kafka"

class ConfigManager {
  public configTopic: string
  public requestTopic: string
  private kafka: Kafka
  private primaryConsumer: Consumer
  private currentConfigs: Configs = {}
  private lastMessage: Message | null = null
  private lastUpdateTimestamp = 0
  private subscriberCallbacks = new Map<
    ComponentId,
    Array<(config: Config) => void>
  >()

  // Init methods

  constructor(clientId: string, configTopic: string, requestTopic: string) {
    const runtimeConfig = useRuntimeConfig()
    this.configTopic = configTopic
    this.requestTopic = requestTopic
    this.kafka = createKafka(clientId, runtimeConfig.kafkaBroker)
    const groupId = `${runtimeConfig.kafkaGroupId ?? "webui"}_${Date.now()}`
    console.log(
      "Using Kafka broker",
      runtimeConfig.kafkaBroker,
      "with group ID",
      groupId,
      "as client",
      clientId,
    )
    this.primaryConsumer = this.kafka.consumer({
      groupId,
    })
  }

  // Update the current configuration with a config message.
  // Overwrites previous values for the same key.
  // When reading from the beginning of the topic, this will construct
  // the current configuration state fully in memory.
  private processMessage(message: Message) {
    const key = message.key?.toString() as ComponentId
    const value = JSON.parse(message.value?.toString() ?? "{}")
    this.currentConfigs[key] = value
    //
    const callbacks = this.subscriberCallbacks.get(key)
    if (callbacks) {
      for (const callback of callbacks) {
        callback(value)
      }
      this.subscriberCallbacks.delete(key)
    }
  }

  // Initialize the ConfigManager state by reading the current configuration
  // from the designated Kafka topic's beginning.
  async initialize() {
    console.log("Initializing ConfigManager...")
    await this.primaryConsumer.connect()
    await this.primaryConsumer.subscribe({ topics: [this.configTopic], fromBeginning: true })
    await this.primaryConsumer.run({
      eachMessage: async ({ message }) => {
        this.lastMessage = message
        this.lastUpdateTimestamp = Date.now()
        this.processMessage(message)
      },
    })
    this.primaryConsumer.seek({
      topic: this.configTopic,
      partition: 0,
      offset: "0",
    })
    console.log("ConfigManager initialized.")
  }

  // Register a callback to be called when a specific component's configuration
  // is received in a new message.
  private subscribeToComponent(
    componentId: ComponentId,
    callback: (config: Config) => void,
  ) {
    if (this.subscriberCallbacks.has(componentId)) {
      this.subscriberCallbacks.get(componentId)?.push(callback)
    } else {
      this.subscriberCallbacks.set(componentId, [callback])
    }
  }

  // Getters

  // Get the current configuration state.
  get configs() {
    return this.currentConfigs
  }

  // Get the last message received from the Kafka topic.
  get lastMessageReceived() {
    return this.lastMessage
  }

  // User-facing methods

  // Get the configuration for a specific component.
  getConfigFor(componentId: ComponentId) {
    if (!this.currentConfigs[componentId]) {
      throw new Error(`No configuration found for component ${componentId}`)
    }
    return this.currentConfigs[componentId]
  }

  // Wait for a new message from a specific component.
  waitForConfigUpdate(componentId: ComponentId): Promise<Config> {
    return new Promise((resolve) => {
      this.subscribeToComponent(componentId, resolve)
    })
  }

  // Send a request to update a component's configuration.
  async updateConfig(request: ConfigChangeRequest) {
    const { component, config } = request
    const producer = this.kafka.producer({
      allowAutoTopicCreation: false,
      createPartitioner: Partitioners.DefaultPartitioner,
    })
    await producer.connect()
    await producer.send({
      topic: this.requestTopic,
      messages: [
        {
          key: component,
          value: JSON.stringify(config),
        },
      ],
    })
    await producer.disconnect()
  }

  async close() {
    await this.primaryConsumer.disconnect()
    console.log("ConfigManager consumer connection closed gracefully.")
  }
}

async function createManager() {
  const runtimeConfig = useRuntimeConfig()
  const configManager = new ConfigManager(
    runtimeConfig.kafkaGroupId ?? "webui",
    "configuration_states",
    "configuration_change_requests",
  )
  await configManager.initialize()
  return configManager
}

export default defineNitroPlugin((nitroApp) => {
  createManager().then((manager) => {
    nitroApp.hooks.hook("request", (event) => {
      event.context.configManager = manager
    })
    nitroApp.hooks.hook("close", async () => {
      await manager.close()
    })
  })
})

export type { ConfigManager }
