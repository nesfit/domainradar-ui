<script setup lang="ts">
import type { IP } from '~/types/domain'
import { groupBy, getContinentFromCoordinates, formatCoordinates } from '@/assets/utils'
import { computed } from 'vue';
import IPDetail from './IPDetail.vue'

const { t } = useI18n()

const props = defineProps<{
  ips: IP[]
}>()

const groupedByCoords = computed(() => {
  const combinedCoords = props.ips.map(ip => ({
    ...ip,
    coords: `${ip.geo?.latitude},${ip.geo?.longitude}`,
  }))
  return groupBy(combinedCoords, "coords")
})

// ideally get city and country from one of the ips, or at least the country, or use the coords if nothing else is available
// try to get the most specific descriptor possible from all the ips
function getBestGeoDescriptor(ips: IP[]) {
  const cities = ips.map(ip => ip.geo?.city).filter(city => city !== null)
  const countries = ips.map(ip => ip.geo?.country).filter(country => country !== null)
  const coords = ips.filter(ip => ip.geo?.longitude && ip.geo?.latitude)
  if (cities.length > 0) {
    return `${cities[0]}, ${countries[0]}`
  } else if (countries.length > 0) {
    return countries[0]
  } else if (coords.length > 0) {
    return getContinentFromCoordinates(coords[0].geo?.latitude ?? 0, coords[0].geo?.longitude ?? 0)
  } else {
    return "Unknown location"
  }
}

function getFormattedCoords(ips: IP[]) {
  const coords = ips
    .filter(ip => ip.geo?.latitude && ip.geo?.longitude)
    .map(ip => [ip.geo?.latitude, ip.geo?.longitude])
    [0]
  if (coords && coords.length === 2 && coords[0] && coords[1]) {
    return `${t('at')} ${formatCoordinates(coords[0], coords[1])}`
  }
  return null
}

</script>

<template>
  <div class="py-4 px-6 bg-slate-200 dark:bg-slate-700 dark:text-slate-50">
    <div v-for="coordGroup, i in groupedByCoords" :key="i" class="mb-4">
      <h2 class="flex flex-wrap items-baseline gap-x-2">
        <div class="font-bold text-xl text-cyan-800 dark:text-cyan-200">
          {{ getBestGeoDescriptor(coordGroup) }}
        </div>
        <div class="text-sm">
          {{ getFormattedCoords(coordGroup) }}
        </div>
      </h2>
      <div v-if="coordGroup[0].asn"><strong>{{ coordGroup[0].asn.as_org }}</strong> <span class="opacity-60">({{
  coordGroup[0].asn.asn }})</span></div>
      <div v-for="net, i in groupBy(coordGroup, 'asn.network_address')" :key="i" class="my-3">
        <h3 class="mb-2 text-lg">
          {{ $t('network') }} <strong class="font-mono text-cyan-700 dark:text-cyan-300">{{ net[0].asn.network_address
            }}</strong> /
          {{ net[0].asn.prefix_len }}
        </h3>
        <IPDetail v-for="ip in net" :key="ip.ip" :ip="ip" class="mb-2" />
      </div>
    </div>
  </div>
</template>