<script setup lang="ts">
import type { DomainData as Domain } from "~/server/api/domains/index.get"
import { percentFormat } from "@/assets/utils"
import { computed } from 'vue';
import Pie from './Pie.vue'
import MalignIcon from './MalignIcon.vue';
import ClassifierDetail from './ClassifierDetail.vue'
import IPDetail from './IPDetail.vue'
import IPGroups from './IPGroups.vue'
import Button from './Button.vue'

const props = withDefaults(defineProps<{
  domain: Domain,
  links?: Record<string, string>
}>(), {
  // @ts-ignore
  links: {}
})

defineEmits(["close"])

const sortedClassificationResults = computed(() => {
  return [...props.domain.classificationResults].sort((a, b) => {
    return b.probability - a.probability
  })
})

const latestClassificationResults = computed(() => latestResults(sortedClassificationResults.value, "timestamp", "category.category"))

const groupedResults = computed(() => {
  return sortedClassificationResults.value.reduce((acc, cur) => {
    if (!acc[cur.category.category]) {
      acc[cur.category.category] = []
    }
    acc[cur.category.category].push(cur)
    return acc
  }, {} as Record<string, Domain["classificationResults"]>)
})

const explodedName = computed(() => {
  return props.domain.domain_name.split(".")
})

const copyDomainName = async () => {
  try {
    await navigator.clipboard.writeText(props.domain.domain_name)
  } catch (err) {
    console.error('Failed to copy domain name:', err)
  }
}

function hasFirstSeen(domain: Domain) {
  return domain.collectionResults.length > 0
}

function getFirstSeen(domain: Domain) {
  // THROWS if domain.collectionResults is empty, check with hasFirstSeen before calling
  return domain.collectionResults.reduce((acc, cur) => {
    const c = new Date(cur.timestamp)
    if (c < acc) {
      return c
    } else {
      return acc
    }
  }, new Date())
}
</script>

<template>
  <div class="bg-holo-bg text-holo-fg p-6 border-2 border-primary">

    <div class="flex gap-x-8 gap-y-4 items-center ms-4 flex-wrap">
      <Pie v-if="typeof domain.aggregate_probability == 'number'" :percent="domain.aggregate_probability * 100"
        v-tooltip="{
  content: $t('aggregate_probability_tooltip'),
          popperClass: 'max-w-80'
        }">
        <div class="text-2xl">{{ percentFormat(domain.aggregate_probability, 0) }}</div>
      </Pie>
      <div>
        <h1 class="text-3xl font-semibold flex flex-wrap items-baseline gap-2">
          <span>
            <span v-for="part in explodedName.slice(0, -1)" :key="part">
              {{ part }}<span class="mx-0.5 text-accent font-extrabold text-4xl">.</span>
            </span><span class="text-accent font-normal">{{ explodedName[explodedName.length - 1]
              }}</span>
          </span>
          <Button @click="copyDomainName" color="accent" hollow borderless symmetrical
            v-tooltip="$t('copy_domain_name')" class="text-sm">
            <MdiIcon icon="mdiContentCopy" />
          </Button>
        </h1>
        <ul class="mt-2 flex gap-4 flex-wrap">
          <li v-for="result in latestClassificationResults" :key="result.category.category" :style="{
            opacity: result.probability + 0.35,
          }" class="flex items-center gap-2">
            <Pie :percent="result.probability * 100" :size="36">
              <MalignIcon :type="result.category.category" />
            </Pie> <strong>{{ percentFormat(result.probability) }}</strong> {{ result.category.category }}
          </li>
        </ul>
      </div>
    </div>

    <div class="mx-4 mt-10 flex flex-wrap gap-2">
      <Modal show-close v-if="domain.collectionResults">
        <template #trigger="{ state }">
          <Button symmetrical color="accent" v-tooltip="$t('collection_results')" @click="state.open = true">
            <MdiIcon icon="mdiBookOpenPageVariant" />
          </Button>
        </template>
        <CollectionResults :collectionResults="domain.collectionResults" />
      </Modal>
      <div class="flex flex-wrap gap-2" v-if="Object.keys(links).length > 0">
        <Button v-for="link, name in props.links" :key="name" :href="link.replace('%s', domain.domain_name)">
          {{ name }}
        </Button>
      </div>
    </div>

    <h2 class="font-bold text-2xl mt-8 mb-4 ms-4">{{ $t('classification_results') }}</h2>
    <div class="flex flex-col gap-4">
      <ClassifierDetail v-for="results, category in groupedResults" :key="category" :results="results" />
    </div>

    <template v-if="props.domain.ipAddresses.length > 0">
      <h2 class="font-bold text-2xl mt-8 mb-4 ms-4">
        {{ $t('ip_addresses') }}
        <span class="text-accent">
          ({{ props.domain.ipAddresses.length }})
        </span>
      </h2>
      <div class="flex flex-col gap-4">
        <IPGroups :ips="props.domain.ipAddresses" />
      </div>
    </template>

    <h2 class="font-bold text-2xl mt-8 mb-4 ms-4">{{ $t('timeline') }}</h2>
    <div class="px-4">
      <div v-if="hasFirstSeen(domain) != null">{{ $t('first_seen') }}: {{ $d(getFirstSeen(domain), 'long') }}
      </div>
      <div v-if="domain.last_update">{{ $t('last_update') }}: {{ $d(domain.last_update, 'long') }}</div>
    </div>

    <div class="mt-8 text-end">
      <Button @click="$emit('close')" color="accent">
        {{ $t('close') }}
        <MdiIcon icon="mdiClose" class="ml-1" />
      </Button>
    </div>

  </div>
</template>