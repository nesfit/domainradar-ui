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

import type { Domain } from "~/types/domain"

const pageStore = usePageStore()
const { page, limit, total } = storeToRefs(pageStore)

const filterSortStore = useFilterSortStore()
const { sortAsc, sortKey, filterAggregateProbability, filterHighestClassifier } = storeToRefs(filterSortStore)

const search = ref("")
const filterAggregateProbabilityLower = computed(() => filterAggregateProbability.value[0])
const filterAggregateProbabilityUpper = computed(() => filterAggregateProbability.value[1])

const { data, error, refresh } = await useFetch("/api/domains", {
  query: {
    page,
    limit,
    search,
    sortAsc,
    sortKey,
    filterAggregateProbabilityLower,
    filterAggregateProbabilityUpper,
    filterHighestClassifier,
  }
})
const domains = computed(() => data.value?.data as unknown as Domain[] ?? [])
watchEffect(() => {
  pageStore.setTotal(data.value?.metadata.totalCount ?? 0)
})

//

const filtersOpen = ref(false)
const sortingOpen = ref(false)

//

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
      <div class="pane-container">
        <header class="text-cyan-900 dark:text-cyan-100 bg-slate-200 dark:bg-slate-700 p-6 flex-shrink">
          <div class="flex gap-x-4 items-end">
            <HInputField color="accent" class="grow" :label="$t('search')" v-model="search" autofocus />
            <HButton class="h-8" color="accent" @click="filtersOpen = !filtersOpen">
              <MdiIcon icon="mdiFilter" /> {{ $t('filter.title') }}
            </HButton>
          </div>
          <div class="flex justify-between items-center mt-4 px-2">
            <button class="flex items-center gap-0.5 text-sm" @click="sortingOpen = !sortingOpen">
              <div>
                {{ $t('sorting.title') }} <span class="font-bold">{{ $t(sortKey) }}</span>
              </div>
              <div class="origin-center transition-transform duration-200" :class="{ 'transform rotate-180': sortAsc }">
                <MdiIcon icon="mdiArrowDown" />
              </div>
            </button>
            <span class="text-sm">
              {{ $t('results', total) }}
            </span>
          </div>
          <FilterPanel class="mt-4" v-if="filtersOpen" />
          <SortPanel class="mt-4" v-if="sortingOpen" />
        </header>
        <main
          class="bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 p-3 overflow-auto h-full flex flex-col">
          <ul class="grow">
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
    <div class="fixed w-full h-full top-0 left-0 -z-10">
      <Map :dots="previewMapDots" />
    </div>
  </div>
</template>

<style scoped>
.pane-container {
  position: fixed;
  top: 3.4em;
  left: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 3.4em);
    width: 24rem;
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

.mist {
  background-image: radial-gradient(#ffffffAA, transparent 80%);
}

@media (prefers-color-scheme: dark) {
  .mist {
    background-image: radial-gradient(#000000AA, transparent 80%);
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
