<script setup lang="ts">
import { percentFormat } from '@/assets/utils'
import { computed } from 'vue';

import type { DomainData } from '~/server/api/domains/index.get';
type IP = DomainData['ipAddresses'][0]

const props = defineProps<{
  ip: IP
}>()

const version = computed(() => {
  if (props.ip.ip.includes(":")) {
    return 6
  } else {
    return 4
  }
})

const hasGeo = computed(() => {
  return props.ip.geo_longitude !== null && props.ip.geo_latitude !== null
})

const hasOffenses = computed(() => {
  return props.ip.qradarOffenseSource && props.ip.qradarOffenseSource[0].offenses.length > 0
})
</script>

<template>
  <div
    class="py-4 px-6 bg-slate-300 dark:bg-slate-600 dark:text-slate-50 flex flex-wrap justify-between items-center gap-2">
    <div>
      <h2 class="font-bold text-xl font-mono flex items-center gap-1" :class="{
        'text-pink-800 dark:text-pink-300': version == 6,
        'text-green-800 dark:text-green-300': version == 4,
      }">
        <MdiIcon icon="mdiNumeric6Box" v-if="version == 6" />
        <MdiIcon icon="mdiNumeric4Box" v-else />
        {{ props.ip.ip }}
      </h2>
      <div class="text-sm" v-if="props.ip.qradarOffenseSource[0]">
        <strong>QRadar:</strong> mag. {{ props.ip.qradarOffenseSource[0].magnitude }}, <strong class="lowercase">{{
          $t('offenses') }}:
          {{
          props.ip.qradarOffenseSource[0].offenses.length }}</strong>
      </div>
    </div>
    <div class="flex gap-1">
      <Modal show-close>
        <template #trigger="{ state }">
          <Button symmetrical color="accent" v-tooltip="$t('collection_results')" @click="state.open = true">
            <MdiIcon icon="mdiBookOpenPageVariant" />
          </Button>
        </template>
        <CollectionResults :collectionResults="ip.collectionResults" />
      </Modal>
      <Button color="destructive" v-if="hasOffenses">{{ $t('offenses') }}</Button>
    </div>
  </div>
</template>