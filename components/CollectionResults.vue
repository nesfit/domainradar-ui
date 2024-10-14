<template>
  <div class="flex flex-col gap-4 min-w-60">
    <div v-for="res in props.collectionResults" :key="res.source">
      <h2 class="text-lg font-bold">{{ res.source }}</h2>
      <p class="text-sm">{{ $d(res.timestamp, "long") }}</p>

      <p class="text-red-500" v-if="res.error">{{ res.error }}</p>
      <p v-else>OK</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Prisma } from '@prisma/client';

const props = defineProps<{
  collectionResults: Prisma.CollectionResultGetPayload<{ omit: { raw_data: true } }>[]
}>()
</script>

<style></style>