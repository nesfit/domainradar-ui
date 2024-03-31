<script setup lang="ts">
definePageMeta(
  {
    pageTransition: {
      name: "page-out",
      mode: "out-in"
    },
    middleware: "auth",
    auth: { guestRedirectTo: "/" }
  }
)
import { ref, computed, onMounted, watch } from "vue"

import DomainRadarLogo from "@/components/DomainRadarLogo.vue"
import DomainListItem from "@/components/DomainListItem.vue"
import PageNavigator from "@/components/PageNavigator.vue"
import Map from "@/components/Map.vue"
import DomainDetail from "@/components/DomainDetail.vue"

import { usePageStore } from "@/stores/pagination"
import { storeToRefs } from "pinia"

import type { Domain } from "@/types/dr"

const pageStore = usePageStore()
const { page } = storeToRefs(pageStore)

const search = ref("")
const ascendingSort = ref(false)

// const { data: domains, error, loading, total, load } = useFecth...
/// TEMP FIX
const domains = ref<Domain[]>([
  {
    domain_name: "example.com",
    aggregate_probability: 0.5,
    ip_addresses: [
      {
        ip: "FUCK",
        collection_results: [],
        qradar_offenses: []
      }
    ],
    aggregate_description: "MRDKA",
    classification_results: [],
    collection_results: [],
    first_seen: new Date(),
    last_seen: new Date(),
    prefilter_results: [],
    nějaký_misp: []
  }
])
const total = ref(0)
const entered = ref(false)
/// TEMP FIX

function loadData() {
  entered.value = true
  // const sort = ascendingSort.value ? invertSort(sortByAggregateProbability) : sortByAggregateProbability
  // load(page.value, sort, (x) => x.domain_name.includes(search.value))
  // TODO
}

onMounted(loadData)
pageStore.$subscribe(loadData)
watch(search, () => {
  pageStore.setPage(1)
  loadData()
})
watch(ascendingSort, loadData)

const activeDomain = ref<Domain | null>(null)
const previewDomain = ref<Domain | null>(null)

function setActiveDomain(domain: Domain | null) {
  if (activeDomain.value === domain) {
    activeDomain.value = null
    previewDomain.value = null
    return
  }
  activeDomain.value = domain
  previewDomain.value = domain
}

function setPreviewDomain(domain: Domain | null) {
  if (activeDomain.value == null) {
    previewDomain.value = domain
  }
}

const previewMapDots = computed(() => {
  if (previewDomain.value === null) {
    return []
  }
  return previewDomain.value.ip_addresses
    .filter((ip) => ip.geo?.longitude && ip.geo?.latitude)
    .map((ip) => {
      return [ip.geo?.longitude, ip.geo?.latitude] as [number, number]
    })
})
</script>

<template>
  <div>
    <!-- Controls -->
    <Transition name="page">
      <div class="pane-container gap-6 py-4" v-if="entered">
        <div class="px-4 mx-4 mt-2 flex justify-between items-center big-ass-drop-shadow">
          <NuxtLink to="/" class="flex items-center gap-2 text-cyan-900 dark:text-cyan-100 cursor-pointer">
            <DomainRadarLogo class="w-8" />
            <strong class="text-lg">DomainRadar</strong>
          </NuxtLink>
          <div class="flex items-center gap-4">
            <span class="text-sm text-cyan-800 dark:text-cyan-200 pointer-events-none">
              {{ $t('up_to_date') }}
              <div class="dot"></div>
            </span>
            <button class="text-cyan-900 dark:text-cyan-100 text-2xl">
              <MdiIcon icon="mdiTune" />
            </button>
          </div>
        </div>
        <header
          class="text-cyan-900 dark:text-cyan-100 bg-slate-100 dark:bg-slate-800 p-6 mx-4 rounded-xl shadow-2xl flex-shrink">
          <div class="flex gap-x-4">
            <input
              class="grow p-2 rounded-md bg-slate-300 dark:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-900 dark:focus:ring-cyan-100 placeholder:text-cyan-900 dark:placeholder:text-cyan-100 text-cyan-900 dark:text-cyan-100"
              :placeholder="$t('search')" v-model="search" autofocus />
            <button class="text-2xl">
              <MdiIcon icon="mdiFilter" />
            </button>
          </div>
          <div class="flex justify-between items-center mt-4 px-2">
            <button class="flex items-center text-sm" @click="ascendingSort = !ascendingSort">
              <div>
                {{ $t('sorting.title') }} <span class="font-bold">{{ $t('sorting.options.agg_prob') }}</span>
              </div>
              <MdiIcon icon="mdiMenuDown" class="origin-center transition-transform duration-200"
                :class="ascendingSort ? 'transform rotate-180' : ''" />
            </button>
            <span class="text-sm" v-if="total > 0">
              {{ total }} {{ $t('results') }}
            </span>
            <span class="text-sm" v-else>
              {{ $t('no_results') }}
            </span>
          </div>
        </header>
        <main
          class="bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 p-3 mx-4 rounded-xl shadow-2xl overflow-auto">
          <ul>
            <DomainListItem v-for="domain in domains" :key="domain.domain_name" :domain="domain"
              :active="domain === activeDomain" @click="setActiveDomain" @mouseenter="setPreviewDomain"
              @mouseleave="setPreviewDomain(null)" />
          </ul>
          <div class="mt-6 flex justify-center">
            <PageNavigator />
          </div>
        </main>
      </div>
    </Transition>
    <!-- Detail -->
    <div class="detail-container px-4 -ms-3">
      <Transition name="detail">
        <DomainDetail class="pointer-events-auto" v-if="activeDomain" :domain="activeDomain"
          @close="setActiveDomain(null)" />
      </Transition>
    </div>
    <!-- Map -->
    <div class="fixed w-full h-full top-0 left-0">
      <Map :dots="previewMapDots" />
    </div>
  </div>
</template>

<style scoped>
.pane-container {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 25rem;
}

.detail-container {
  position: fixed;
  top: 0;
  left: 25rem;
  z-index: 100;
  width: calc(100vw - 25rem);
  max-width: 50rem;
  height: 100vh;
  overflow-y: auto;
  padding-block-start: 5rem;
  padding-block-end: 2.25rem;
  pointer-events: none;
}

.dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: #23DC52;
  border: 2px solid #13AC32;
  display: inline-block;
}

.mist {
  background-image: radial-gradient(#ffffffAA, transparent 80%);
}

@media (prefers-color-scheme: dark) {
  .mist {
    background-image: radial-gradient(#000000AA, transparent 80%);
  }
}

.big-ass-drop-shadow {
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.5)) drop-shadow(0 0 10px rgba(255, 255, 255, 0.7)) drop-shadow(0 0 20px rgba(255, 255, 255, 0.5)) drop-shadow(0 0 30px rgba(255, 255, 255, 0.4));
}

@media (prefers-color-scheme: dark) {
  .big-ass-drop-shadow {
    filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 10px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 20px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 30px rgba(0, 0, 0, 0.2));
  }
}

.detail-enter-active {
  transition: opacity 200ms, translate 500ms cubic-bezier(0.19, 1, 0.22, 1);
}

.detail-leave-active {
  transition: opacity 200ms, translate 200ms cubic-bezier(0.95, 0.05, 0.795, 0.035);
}

.detail-enter-from,
.detail-leave-to {
  translate: -100% 0;
  opacity: 0;
}
</style>
