<template>
  <div class="px-16 py-8 flex flex-col gap-12 max-w-screen-xl">
    <div class="flex items-center gap-2 text-2xl font-black text-cyan-900 dark:text-cyan-100 -ml-8">
      <button @click="go(-1)">
        <MdiIcon icon="mdiArrowLeft" />
      </button>
      <h1>{{ $t('prefiltered.title') }}</h1>
    </div>
    <ul>
      <li v-for="(domains, filterName) in domainsByFilterName" :key="filterName">
        <h2 class="text-xl font-bold text-cyan-900 dark:text-cyan-100">{{ filterName }}</h2>
        <ul class="mb-8">
          <li v-for="domain in domains" :key="domain.domain">
            <div class="flex items-center gap-2">
              <span :style="getTextStyle(domain.domain)">{{ domain.domain }}</span>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ $d(domain.last_seen, 'long') }}</span>
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

const { go } = useRouter()
const { data, error, refresh } = await useFetch("/api/domains/prefiltered")
const { data: colors } = await useFetch("/api/config/prefiltercolors")

const domainsByFilterName = computed(() => {
  if (!data.value) return {}
  const achjo: Record<string, Data> = data.value.data.reduce((acc: Record<string, Data>, domain) => {
    const filter_output = domain.filter_output && typeof domain.filter_output === "object" ? domain.filter_output as Record<string, any> : { "No prefilter output": 0 }
    const filters = Object.keys(filter_output)
    for (const filter of filters) {
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

function getTextStyle(domainName: string) {
  if (!colors.value) return {}
  //
  for (const [pattern, color] of Object.entries(colors.value)) {
    if (domainName.match(new RegExp(pattern))) {
      return { color }
    }
  }
  //
  return {}
}
</script>