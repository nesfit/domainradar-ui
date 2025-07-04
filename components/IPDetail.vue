<script setup lang="ts">
import { percentFormat } from '@/assets/utils'
import format from '@/utils/format'
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
  <div class="py-4 px-6 bg-accent/10 text-holo-fg flex flex-wrap justify-between items-center gap-2">
    <div>
      <h2 class="font-bold text-xl font-mono flex items-center gap-1" :class="{
        'text-destructive': version == 6,
        'text-accent': version == 4,
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
        <!-- <qradar url>/console/qradar/jsp/QRadar.jsp?appName=Sem&pageId=AttackerOffenseList&summaryId=<SOURCE ADDR ID> -->
        <a class="flex gap-1"
          :href="`${$config.public.qradarBaseUrl}/console/do/struts2/core/summarylist?appName=Sem&pageId=AttackerOffenseList&summaryId=${ip.qradarOffenseSource[0].id}`"
          target="_blank">{{
            $t('source_id') }} {{ ip.qradarOffenseSource[0].id }}
          <MdiIcon icon="mdiOpenInNew" />
        </a>
        <div>IP {{ ip.qradarOffenseSource[0].ip }}</div>
        <div>{{ $t('magnitude') }}: {{ ip.qradarOffenseSource[0].magnitude }}</div>
        <ul class="mt-4">
          <li class="my-2" v-for="{ offense } in ip.qradarOffenseSource[0].offenses" :key="Number(offense.id)">
            <Modal show-close>
              <template #trigger="{ state }">
                <div class="flex gap-1 items-center">
                  <Button @click="state.open = true">
                    {{ $t('detail') }}
                  </Button>
                  <span>{{ offense.id }}</span>
                </div>
              </template>
              <div class="max-w-lg">
                <!-- <qradar url>/console/qradar/jsp/QRadar.jsp?appName=Sem&pageId=OffenseSummary&summaryId=<OFFENSE ID> -->
                <a :href="`${$config.public.qradarBaseUrl}/console/do/sem/offensesummary?appName=Sem&pageId=OffenseSummary&summaryId=${offense.id}`"
                  target="_blank">
                  <h3 class="text-xl font-bold flex gap-1">{{ $t('id') }} {{ offense.id }}
                    <MdiIcon icon="mdiOpenInNew" />
                  </h3>
                </a>
                <div><strong>{{ $t('description') }}</strong>: <span v-html="format(offense.description || '')"></span>
                </div>
                <div><strong>{{ $t('status') }}</strong>: {{ offense.status }}</div>
                <div><strong>{{ $t('magnitude') }}</strong>: {{ offense.magnitude }}</div>
                <div><strong>{{ $t('event_count') }}</strong>: {{ offense.event_count }}</div>
                <div><strong>{{ $t('flow_count') }}</strong>: {{ offense.flow_count }}</div>
                <div><strong>{{ $t('device_count') }}</strong>: {{ offense.device_count }}</div>
                <div><strong>{{ $t('severity') }}</strong>: {{ offense.severity }}</div>
                <div><strong>{{ $t('last_updated_time') }}</strong>: {{ $d(offense.last_updated_time, "long") }}</div>
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