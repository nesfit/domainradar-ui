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

const explodedName = computed(() => {
  return props.domain.domain_name.split(".")
})
</script>

<template>
  <div
    class="bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 p-6 border-2 border-slate-400 dark:border-slate-600">

    <div class="flex gap-x-8 gap-y-4 items-center ms-4 flex-wrap">
      <Pie :percent="props.domain.aggregate_probability * 100">
        <div class="text-2xl">{{ percentFormat(props.domain.aggregate_probability, 0) }}</div>
      </Pie>
      <div>
        <h1 class="text-3xl font-semibold flex flex-wrap items-baseline">
          <span v-for="part in explodedName.slice(0, -1)" :key="part">
            {{ part }}<span class="mx-0.5 text-cyan-600 dark:text-cyan-400 font-extrabold text-4xl">.</span>
          </span><span class="text-cyan-800 dark:text-cyan-200 font-normal">{{ explodedName[explodedName.length - 1]
            }}</span>
        </h1>
        <ul class="mt-2 flex gap-4 flex-wrap">
          <li v-for="result in sortedClassificationResults" :key="result.category.category" :style="{
            opacity: result.probability + 0.35,
          }" class="flex items-center gap-2">
            <Pie :percent="result.probability * 100" :size="36">
              <MalignIcon :type="result.category.category" />
            </Pie> <strong>{{ percentFormat(result.probability) }}</strong> {{ result.category }}
          </li>
        </ul>
      </div>
    </div>

    <div class="mx-4 mt-10 flex flex-wrap gap-2">
      <Modal show-close v-if="domain.collectionResults">
        <template #trigger="{ state }">
          <Button symmetrical color="accent" v-tooltip="$t('collectionResults')" @click="state.open = true">
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

    <h2 class="font-bold text-2xl mt-8 mb-4 ms-4">{{ $t('classificationResults') }}</h2>
    <div class="flex flex-col gap-4">
      <ClassifierDetail v-for="result in sortedClassificationResults" :key="result.category.category"
        :result="result" />
    </div>

    <template v-if="props.domain.ipAddresses.length > 0">
      <h2 class="font-bold text-2xl mt-8 mb-4 ms-4">
        {{ $t('ip_addresses') }}
        <span class="text-cyan-800 dark:text-cyan-300 font-normal">
          ({{ props.domain.ipAddresses.length }})
        </span>
      </h2>
      <div class="flex flex-col gap-4">
        <IPGroups :ips="props.domain.ipAddresses" />
      </div>
    </template>

    <h2 class="font-bold text-2xl mt-8 mb-4 ms-4">{{ $t('timeline') }}</h2>
    <div class="px-4">
      <!-- TODO implement first seen via latest result timestamp -->
      <!-- <div v-if="domain.first_seen">{{ $t('first_seen') }}: {{ $d(props.domain.first_seen, 'long') }}</div> -->
    </div>

    <div class="mt-8 text-end">
      <Button @click="$emit('close')" color="accent">
        {{ $t('close') }}
        <MdiIcon icon="mdiClose" class="ml-1" />
      </Button>
    </div>

  </div>
</template>