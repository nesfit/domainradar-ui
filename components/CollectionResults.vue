<template>
  <div class="flex flex-col gap-4 min-w-60 text-holo-fg">
    <div v-for="res in props.collectionResults.filter(r => r.source.is_ip_collector === ip)" :key="res.source.id">
      <h2 class="text-lg font-bold">{{ res.source.collector }}</h2>
      <p class="text-sm">{{ $d(res.timestamp, "long") }}</p>

      <div v-if="res.status_code === 0">
        <p>OK</p>
      </div>
      <div v-else>
        <p v-tooltip="getStatusDescription(res.status_code)" class="cursor-help text-red-500">
          {{ getStatusName(res.status_code) }}
        </p>
      </div>

      <p class="text-red-500 text-xs" v-if="res.error">{{ res.error }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Prisma } from '@prisma/client';

const props = withDefaults(defineProps<{
  collectionResults: Prisma.CollectionResultGetPayload<{ include: { source: true }, omit: { raw_data: true } }>[]
  ip?: boolean
}>(), {
  ip: false
})

// Define the status type based on the Prisma model
type CollectorStatusType = {
  status_code: number
  name: string
  description: string | null
}

// Get unique status codes from collection results
const uniqueStatusCodes = [...new Set(props.collectionResults.map(r => r.status_code).filter(code => code !== 0))]

// Fetch only the relevant status types
const statusTypesMap = new Map<number, CollectorStatusType>()

// Fetch each unique status type
await Promise.all(
  uniqueStatusCodes.map(async (statusCode) => {
    try {
      const status = await $fetch<CollectorStatusType>(`/api/collector_status?status_code=${statusCode}`)
      statusTypesMap.set(statusCode, status)
    } catch (error) {
      // If status not found, we'll use fallback
    }
  })
)

const getStatusName = (statusCode: number) => {
  const status = statusTypesMap.get(statusCode)
  return status?.name || `Status ${statusCode}`
}

const getStatusDescription = (statusCode: number) => {
  const status = statusTypesMap.get(statusCode)
  return status?.description || ''
}
</script>

<style></style>