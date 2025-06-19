<template>
  <div class="px-16 py-8 flex flex-col gap-12 max-w-screen-xl">
    <div class="flex items-center gap-2 text-2xl font-black  -ml-8">
      <button @click="go(-1)">
        <MdiIcon icon="mdiArrowLeft" />
      </button>
      <h1>{{ $t('prefiltered.title') }}</h1>
    </div>
    <!-- Search and Filter Controls -->
    <div class="flex gap-4 items-center">
      <HInputField v-model="search" type="text" :placeholder="$t('search')" />
      <select v-model="selectedFilter" class="border rounded px-2 py-1">
        <option value="">{{ $t('prefiltered.all_filters') }}</option>
        <option v-for="filter in filterNames" :key="filter" :value="filter">
          {{ filter }}
        </option>
      </select>
    </div>
    <ul>
      <li v-for="(domains, filterName) in filteredDomainsByFilterName" :key="filterName">
        <h2 class="text-xl font-bold ">{{ filterName }}</h2>
        <ul class="mb-8">
          <li v-for="domain in domains" :key="domain.domain">
            <div class="flex items-center gap-2">
              <span :style="getTextStyle(domain.domain)">{{ domain.domain }}</span>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ getActionName(domain, filterName) }}</span>
              <span class="text-sm text-holo-fg/50">{{ $t('since') }} {{ $d(domain.first_seen, 'long') }}</span>
            </div>
            <!-- <div class="text-sm text-gray-500 dark:text-gray-400">{{ domain.filterResult }}</div> -->
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import type { Data } from "~/server/api/domains/prefiltered.get"
definePageMeta(
  {
    middleware: "auth",
    auth: { guestRedirectTo: "/" }
  }
)

const { t } = useI18n()

const { go } = useRouter()
const { data, error, refresh } = await useFetch("/api/domains/prefiltered")
const { data: colors } = await useFetch("/api/config/prefiltercolors")

const domainsByFilterName = computed(() => {
  if (!data.value) return {}
  const achjo: Record<string, Data> = data.value.data
    .filter((domain) => domain.filter_output && typeof domain.filter_output === "object")
    .reduce((acc: Record<string, Data>, domain) => {
      const filter_output = domain.filter_output as Record<string, any>
      const filters = Object.entries(filter_output)
      for (const [filter, result] of filters) {
        if (result == 0) continue // skip if result is 0 (pass)
        if (!acc[filter]) {
          acc[filter] = []
        }
        acc[filter].push({
          ...domain,
          first_seen: new Date(domain.first_seen),
          last_seen: new Date(domain.last_seen),
        })
      }
      return acc
  }, {})
  // return achjo with "No prefilter output" last
  return Object.fromEntries(Object.entries(achjo).sort(([a], [b]) => {
    if (a === "No prefilter output") return 1
    if (b === "No prefilter output") return -1
    return a.localeCompare(b)
  }))
})

const search = ref("")
const selectedFilter = ref("")
const filterNames = computed(() => Object.keys(domainsByFilterName.value))

const filteredDomainsByFilterName = computed(() => {
  let filtered = domainsByFilterName.value
  // Filter by selected filter
  if (selectedFilter.value) {
    filtered = { [selectedFilter.value]: filtered[selectedFilter.value] || [] }
  }
  // Filter domains by search
  const searchTerm = search.value.trim().toLowerCase()
  if (!searchTerm) return filtered
  const result: Record<string, Data> = {}
  for (const [filterName, domains] of Object.entries(filtered)) {
    const filteredDomains = domains.filter(domain =>
      domain.domain.toLowerCase().includes(searchTerm)
    )
    if (filteredDomains.length > 0) {
      result[filterName] = filteredDomains
    }
  }
  return result
})

function getTextStyle(domainName: string) {
  if (!colors.value) return {}
  //
  for (const [pattern, color] of Object.entries(colors.value)) {
    try {
      const domainNamePattern = new RegExp(pattern)
      if (domainName.match(domainNamePattern)) {
        return { color }
      }
    } catch (e) {
      console.error(`Invalid pattern: ${pattern}`)
    }
  }
  //
  return {}
}

function getActionName(domain: Data[0], filterName: string) {
  // @ts-ignore
  const result = domain.filter_output[filterName] as number | undefined
  if (result === undefined) return "?"
  if (result === 0) return t('prefiltered.passed')
  if (result === 1) return t('prefiltered.dropped')
  if (result === 2) return t('prefiltered.stored')
}
</script>