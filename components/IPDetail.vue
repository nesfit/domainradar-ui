<script setup lang="ts">
import type { IP } from '@/types/dr'
import { percentFormat } from '@/assets/utils'
import V4 from 'vue-material-design-icons/Numeric4Box.vue'
import V6 from 'vue-material-design-icons/Numeric6Box.vue'
import { computed } from 'vue';

const props = defineProps<{
  ip: IP
}>()

const version = computed(() => {
  if (props.ip.ip.includes(":")) {
    return 6
  } else {
    return 4
  }
})

const hasGeo = computed(() => {
  return props.ip.geo !== null
})
</script>

<template>
  <div
    class="py-4 px-6 bg-slate-300 rounded-lg dark:bg-slate-600 dark:text-slate-50"
  >
    <h2
      class="font-bold text-xl font-mono"
      :class="{
        'text-pink-800 dark:text-pink-300': version == 6,
        'text-green-800 dark:text-green-300': version == 4,
      }"
    >
      <V6 v-if="version == 6" />
      <V4 v-else />
      {{ props.ip.ip }}
    </h2>    
  </div>
</template>