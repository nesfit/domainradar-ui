<script setup lang="ts">
import type { ClassificationResult } from '~/types/domain'
import { percentFormat } from '@/assets/utils'
import MalignIcon from './MalignIcon.vue';
import { computed } from 'vue';

const props = defineProps<{
  result: ClassificationResult
}>()

const hasDetails = computed(() => {
  if (!props.result.details) {
    return false
  }
  return Object.keys(props.result.details).length > 0
})
</script>

<template>
  <div class="py-4 px-6 bg-slate-200 dark:bg-slate-700 dark:text-slate-50">
    <div class="flex justify-between items-center flex-wrap">
      <h2 class="font-bold text-cyan-800 dark:text-cyan-200 text-xl inline-flex gap-1 items-center">
        <MalignIcon :type="result.classifier" />
        {{ result.classifier }}
      </h2>
      <h3 v-if="result.classification_date" class="text-xs">{{ $d(result.classification_date, 'long') }}</h3>
    </div>
    <p>{{ result.description }}</p>
    <div class="mt-4" v-if="hasDetails">
      <h3 class="font-semibold text-cyan-800 dark:text-cyan-200 text-lg">Details</h3>
      <ul>
        <li class="my-1" v-for="value, key in result.details" :key="key">
          <h4 class="font-semibold text-cyan-700 dark:text-cyan-300">{{ key }}</h4>
          <p>{{ value }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>