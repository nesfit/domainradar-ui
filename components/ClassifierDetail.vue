<script setup lang="ts">
import type { Prisma } from '@prisma/client';
import { percentFormat } from '@/assets/utils'
import format from '@/utils/format'
import MalignIcon from './MalignIcon.vue';
import { computed } from 'vue';

const props = defineProps<{
  results: Prisma.ClassificationCategoryResultGetPayload<{ include: { category: true, classifierOutputs: { include: { classifier: true } } } }>[]
}>()

const timestampSortedResults = computed(() => {
  return [...props.results].sort((a, b) => {
    return b.timestamp > a.timestamp ? 1 : -1
  })
})

const activeIndex = ref(0)
watch(() => props.results, () => {
  activeIndex.value = 0
})

function older() {
  if (activeIndex.value < timestampSortedResults.value.length - 1) {
    activeIndex.value++
  }
}

function newer() {
  if (activeIndex.value > 0) {
    activeIndex.value--
  }
}

const hasOlder = computed(() => {
  return activeIndex.value < timestampSortedResults.value.length - 1
})

const hasNewer = computed(() => {
  return activeIndex.value > 0
})

const result = computed(() => {
  return timestampSortedResults.value[activeIndex.value]
})

const hasDetails = computed(() => {
  if (!result.value.details) {
    return false
  }
  return Object.keys(result.value.details).length > 0
})
</script>

<template>
  <div class="py-4 px-6 bg-slate-200 dark:bg-slate-700 dark:text-slate-50">
    <div class="flex justify-between items-center flex-wrap">
      <h2 class="font-bold text-cyan-800 dark:text-cyan-200 text-xl inline-flex gap-2 items-center mb-2">
        <Pie :percent="result.probability * 100" :size="36">
          <MalignIcon :type="result.category.category" />
        </Pie>
        <strong>{{ percentFormat(result.probability) }}</strong> {{ result.category.category }}
      </h2>
      <div class="flex gap-2">
        <button @click="older" :disabled="!hasOlder" class="disabled:opacity-20">
          <MdiIcon icon="mdiArrowLeft" />
        </button>
        <h3 v-if="result.timestamp" class="text-xs">{{ $d(result.timestamp, 'long') }}</h3>
        <button @click="newer" :disabled="!hasNewer" class="disabled:opacity-20">
          <MdiIcon icon="mdiArrowRight" />
        </button>
      </div>
    </div>
    <p class="font-bold" v-html="format(result.description || '')"></p>
    <div class="mt-4">
      <!-- <h3 class="font-semibold text-cyan-800 dark:text-cyan-200 text-lg">Details</h3> -->
      <ul>
        <li class="my-1" v-for="output, key in result.classifierOutputs" :key="key">
          <h4 class="font-semibold text-cyan-700 dark:text-cyan-300">{{ output.classifier.classifier }} <span
              class="text-slate-800 dark:text-slate-100 font-normal">
              {{
              percentFormat(output.probability) }}
            </span></h4>
          <p v-if="output.additional_info">{{ output.additional_info }}</p>
        </li>
      </ul>
    </div>
    <div class="mt-4" v-if="hasDetails">
      <h3 class="font-semibold text-cyan-800 dark:text-cyan-200 text-lg">{{ $t("details") }}</h3>
      <ul>
        <li class="my-1" v-for="value, key in result.details" :key="key">
          <h4 class="font-semibold text-cyan-700 dark:text-cyan-300">{{ key }}</h4>
          <p>{{ value }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>