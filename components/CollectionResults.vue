<template>
  <div class="flex flex-col gap-4 min-w-60 dark:text-slate-100 text-slate-800">
    <div v-for="res in props.collectionResults.filter(r => r.source.is_ip_collector === ip)" :key="res.source.id">
      <h2 class="text-lg font-bold">{{ res.source.collector }}</h2>
      <p class="text-sm">{{ $d(res.timestamp, "long") }}</p>

      <p class="text-red-500" v-if="res.error">{{ res.error }}</p>
      <p v-else>OK</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Prisma } from '@prisma/client';

const props = withDefaults(defineProps<{
  collectionResults: Prisma.CollectionResultGetPayload<{ include: { source: true }, omit: { raw_data: true } }>[]
  ip: boolean
}>(), {
  ip: false
})
</script>

<style></style>