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
    <h2 class="font-bold text-cyan-800 dark:text-cyan-200 text-xl">
      <MalignIcon :type="props.result.classifier" />
      {{ props.result.classifier }}
    </h2>
    <p>{{ props.result.description }}</p>
    <div class="mt-4" v-if="hasDetails">
      <h3 class="font-semibold text-cyan-800 dark:text-cyan-200 text-lg">Details</h3>
      <ul>
        <li class="my-1" v-for="value, key in props.result.details" :key="key">
          <h4 class="font-semibold text-cyan-700 dark:text-cyan-300">{{ key }}</h4>
          <p>{{ value }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>