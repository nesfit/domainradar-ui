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
  return props.ip.qradarOffenseSource.length > 0 && props.ip.qradarOffenseSource[0].offenses.length > 0
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
        {{ ip.ip }}
      </h2>
      <div class="text-sm" v-if="ip.qradarOffenseSource[0]">
        <strong>QRadar:</strong> mag. {{ ip.qradarOffenseSource[0].magnitude }}, <strong class="lowercase">{{
          $t('offenses') }}:
          {{
            ip.qradarOffenseSource[0].offenses.length }}</strong>
      </div>
    </div>
    <div class="flex gap-1">
      <Modal show-close v-if="hasOffenses">
        <!-- TODO: make less ugly and separate component -->
        <template #trigger="{ state }">
          <Button symmetrical color="accent" v-tooltip="$t('offenses')" @click="state.open = true">
            <MdiIcon icon="mdiAlarmLight" />
          </Button>
        </template>
        <h2 class="text-xl font-bold">{{ $t('offenses') }}</h2>
        <div>{{ $t('source_id') }} {{ ip.qradarOffenseSource[0].id }}</div>
        <div>IP {{ ip.qradarOffenseSource[0].ip_id }}</div>
        <div>{{ $t('magnitude') }}: {{ ip.qradarOffenseSource[0].magnitude }}</div>
        <ul>
          <li v-for="offense in ip.qradarOffenseSource[0].offenses" :key="offense.id">
            <Modal show-close>
              <template #trigger="{ state }">
                <div class="flex gap-1 items-center">
                  <span>{{ offense.id }}</span>
                  <Button @click="state.open = true">
                    {{ $t('detail') }}
                  </Button>
                </div>
              </template>
              <div>
                <h3 class="text-xl font-bold">{{ $t('id') }} {{ offense.id }}</h3>
                <div><strong>{{ $t('source_id') }}</strong>: {{ offense.source_id }}</div>
                <div><strong>{{ $t('description') }}</strong>: {{ offense.description }}</div>
                <div><strong>{{ $t('status') }}</strong>: {{ offense.status }}</div>
                <div><strong>{{ $t('magnitude') }}</strong>: {{ offense.magnitude }}</div>
                <div><strong>{{ $t('event_count') }}</strong>: {{ offense.event_count }}</div>
                <div><strong>{{ $t('flow_count') }}</strong>: {{ offense.flow_count }}</div>
                <div><strong>{{ $t('device_count') }}</strong>: {{ offense.device_count }}</div>
                <div><strong>{{ $t('severity') }}</strong>: {{ offense.severity }}</div>
                <div><strong>{{ $t('last_updated_time') }}</strong>: {{ offense.last_updated_time }}</div>
              </div>
            </Modal>
          </li>
        </ul>
      </Modal>
      <Modal show-close>
        <template #trigger="{ state }">
          <Button symmetrical color="accent" v-tooltip="$t('collection_results')" @click="state.open = true">
            <MdiIcon icon="mdiBookOpenPageVariant" />
          </Button>
        </template>
        <CollectionResults ip :collectionResults="ip.collectionResults" />
      </Modal>
    </div>
  </div>
</template>