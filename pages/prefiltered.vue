<template>
  <div class="px-16 py-8 flex flex-col gap-12 max-w-screen-xl">
    <div class="flex items-center gap-2 text-2xl font-black  -ml-8">
      <button @click="go(-1)">
        <MdiIcon icon="mdiArrowLeft" />
      </button>
      <h1>{{ $t('prefiltered.title') }}</h1>
    </div>
    <!-- Search Controls -->
    <div class="flex gap-4 items-center">
      <HInputField v-model="searchInputTerm" type="text" :placeholder="$t('search')" @keyup.enter="setNewSearchTerm" />
      <HButton @click="setNewSearchTerm">{{ $t('search') }}</HButton>
    </div>
    <div>
      <PageNavigator :refreshing="pending" paginator="prefiltered" />
    </div>
    <ul>
      <li v-for="domain in domains" :key="domain.domain" class="mb-4">
        <div>
          <span :style="getTextStyle(domain.domain)">{{ domain.domain }}</span>
          <div class="flex items-center gap-2 flex-wrap mt-1">
            <template v-for="(result, filterName) in getFilterActions(domain)" :key="filterName">
              <span class="px-2 py-0.5 rounded bg-accent text-holo-bg text-xs">
                {{ getActionName(result) }}: {{ filterName }}
              </span>
            </template>
          </div>
        </div>
      </li>
    </ul>
    <div>
      <PageNavigator :refreshing="pending" paginator="prefiltered" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { usePageStore } from '@/stores/pagination'
import { storeToRefs } from 'pinia'
const { t } = useI18n()
const { go } = useRouter()
const { data: colors } = await useFetch("/api/config/prefiltercolors")

const PAGINATOR = "prefiltered"
const pageStore = usePageStore()
const page = pageStore.page(PAGINATOR)
const limit = pageStore.limit(PAGINATOR)
const total = pageStore.total(PAGINATOR)

const searchInputTerm = ref("")
const search = ref("")
function setNewSearchTerm() {
  search.value = searchInputTerm.value
  pageStore.setPage(1, PAGINATOR)
}

const { data, error, refresh, pending } = await useFetch("/api/domains/prefiltered", {
  query: { page, limit, search },
  watch: [page, limit, search],
  lazy: true,
})

const domains = computed(() => data.value?.data ?? [])
const metadata = computed(() => data.value?.metadata ?? { totalCount: 0, page: 1, limit: 20 })

watch(metadata, (meta) => {
  if (meta && typeof meta.totalCount === 'number') {
    pageStore.setTotal(meta.totalCount, PAGINATOR)
  }
}, { immediate: true })

function getTextStyle(domainName: string) {
  if (!colors.value) return {}
  for (const [pattern, color] of Object.entries(colors.value)) {
    try {
      const domainNamePattern = new RegExp(pattern)
      if (domainName.match(domainNamePattern)) {
        return { color }
      }
    } catch (e) {
      // ignore invalid regex
    }
  }
  return {}
}

function getFilterActions(domain: any) {
  const out: Record<string, number> = {}
  if (domain.filter_output && typeof domain.filter_output === 'object') {
    for (const [filter, result] of Object.entries(domain.filter_output)) {
      if (typeof result === 'number' && result > 0) {
        out[filter] = result
      }
    }
  }
  return out
}

function getActionName(result: number) {
  if (result === 1) return t('prefiltered.dropped')
  if (result === 2) return t('prefiltered.stored')
  return t('prefiltered.passed')
}
</script>