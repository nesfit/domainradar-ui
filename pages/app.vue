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

import DomainListItem from "@/components/DomainListItem.vue"
import PageNavigator from "@/components/PageNavigator.vue"
import Map from "@/components/Map.vue"
import DomainDetail from "@/components/DomainDetail.vue"

import { usePageStore } from "@/stores/pagination"
import { storeToRefs } from "pinia"

import type { DomainData as Domain } from "~/server/api/domains/index.get"

const pageStore = usePageStore()
const { page, limit, total } = storeToRefs(pageStore)

const filterSortStore = useFilterSortStore()
const { sortAsc, sortKey, filterAggregateProbability } = storeToRefs(filterSortStore)

const search = ref("")
const filterAggregateProbabilityLower = computed(() => filterAggregateProbability.value[0])
const filterAggregateProbabilityUpper = computed(() => filterAggregateProbability.value[1])

const abortController = new AbortController()
const totalCountRequestInFlight = ref(false)
function refreshTotalCount() {
  if (totalCountRequestInFlight.value) {
    abortController.abort("New request received")
  }
  console.log("Refreshing total count in the background")
  console.time("Total Count Refresh")
  totalCountRequestInFlight.value = true
  $fetch("/api/domains/count", {
    query: {
      search: search.value,
      filterAggregateProbabilityLower: filterAggregateProbabilityLower.value,
      filterAggregateProbabilityUpper: filterAggregateProbabilityUpper.value,
    },
    signal: abortController.signal,
  }).then(({ data }) => {
    totalCountRequestInFlight.value = false
    pageStore.setTotal(data.totalCount)
    console.timeEnd("Total Count Refresh")
  })
}

onMounted(() => {
  refreshTotalCount()
})

function refreshTotalOnParamChange() {
  useDebounceFn(refreshTotalCount, 500)()
  pageStore.setPage(1)
}

const { data, error, refresh, pending: domainsLoading } = await useFetch("/api/domains", {
  query: {
    page,
    limit,
    search,
    sortAsc,
    sortKey,
    filterAggregateProbabilityLower,
    filterAggregateProbabilityUpper,
  },
  lazy: true,
})
const domains = computed(() => data.value?.data ?? [])
filterSortStore.$subscribe(refreshTotalOnParamChange)
watch(search, refreshTotalOnParamChange)

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
  return previewDomain.value.ipAddresses
    .filter((ip) => ip.geo_longitude && ip.geo_latitude)
    .map((ip) => {
      return [ip.geo_longitude, ip.geo_latitude] as [number, number]
    })
})

const { data: domainLinks } = await useFetch('/api/config/links')
</script>

<template>
  <div>
    <!-- Controls -->
    <Transition name="page">
      <div class="pane-container top-16">
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
            <span class="text-sm" v-if="!totalCountRequestInFlight">
              {{ $t('results', total) }}
            </span>
            <span class="text-sm animate-spin" v-else>
              <MdiIcon icon="mdiLoading" />
            </span>
          </div>
          <FilterPanel class="mt-4" v-if="filtersOpen" />
          <SortPanel class="mt-4" v-if="sortingOpen" />
        </header>
        <main
          class="bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 p-3 overflow-auto h-full flex flex-col">
          <ul class="grow transition-all duration-300" :class="{ 'filter blur-sm': domainsLoading }">
            <DomainListItem v-for="domain in domains" :key="domain.domain_name" :domain="domain"
              :active="domain.domain_name === activeDomain?.domain_name" @click="setActiveDomain"
              @mouseenter="setPreviewDomain" @mouseleave="setPreviewDomain(null)" />
          </ul>
          <div v-if="domainsLoading" class="absolute inset-0 flex items-center justify-center opacity-0 show-after-1s">
            <img src="/cheese.webp" alt="Loading" class="w-1/2" />
          </div>
          <div class="mt-6 flex justify-center">
            <PageNavigator :refreshing="totalCountRequestInFlight" />
          </div>
        </main>
      </div>
    </Transition>
    <!-- Detail -->
    <div class="detail-container px-4 -ms-3">
      <Transition name="detail">
        <DomainDetail class="pointer-events-auto" v-if="activeDomain" :domain="activeDomain" :links="domainLinks || {}"
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
  left: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 4em);
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
.show-after-1s {
  animation: showAfter1s 1s 1s forwards;
}

@keyframes showAfter1s {
  to {
    opacity: 1;
  }
}
</style>
