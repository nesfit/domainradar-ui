<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  href?: string
  disabled?: boolean
}>()

const isExternalLink = computed(() => {
  return props.href?.startsWith("http")
})

const componentType = computed(() => {
  if (props.href) {
    return "a"
  } else {
    return "button"
  }
})
</script>

<template>
  <component :is="componentType"
    class="inline-block bg-slate-500 text-slate-50 dark:bg-slate-100 dark:text-slate-800 py-1 px-2 rounded-md shadow-md transition-colors duration-200"
    :class="{
      'cursor-not-allowed opacity-50': props.disabled,
      'hover:bg-slate-600 dark:hover:bg-slate-300': !props.disabled,
    }" :href="props.href" :disabled="props.disabled" v-bind="$attrs">
    <slot />
    <MdiIcon icon="mdiOpenInNew" v-if="isExternalLink" />
  </component>
</template>