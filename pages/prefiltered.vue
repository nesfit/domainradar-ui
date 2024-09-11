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
        <ul>
          <li v-for="domain in domains" :key="domain.domain">
            <div class="flex items-center gap-2">
              <span :style="getTextStyle(domain.domain)">{{ domain.domain }}</span>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ $d(domain.timestamp, 'long') }}</span>
            </div>
            <!-- <div class="text-sm text-gray-500 dark:text-gray-400">{{ domain.filterResult }}</div> -->
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
definePageMeta(
  {
    middleware: "auth",
    auth: { guestRedirectTo: "/" }
  }
)

const { go } = useRouter()
const { data, error, refresh } = await useFetch("/api/domains/prefiltered")
const { data: colors } = await useFetch("/api/config/prefiltercolors")

type PrefilteredDomain = {
  domain: string
  timestamp: Date
  filterResult: number
}

const domainsByFilterName = computed(() => {
  if (!data.value) return {}
  const achjo: Record<string, PrefilteredDomain[]> = data.value.data.reduce((acc: Record<string, PrefilteredDomain[]>, domain: Record<string, any>) => { // SHUT UP TS
    const filters = Object.keys(domain).filter(key => key !== "_id")
    for (const filter of filters) {
      if (!acc[filter]) {
        acc[filter] = []
      }
      acc[filter].push({
        domain: domain._id.domainName,
        timestamp: domain._id.timestamp,
        filterResult: domain[filter]
      })
    }
    return acc
  }, {})
  return achjo
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