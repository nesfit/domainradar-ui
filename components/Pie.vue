<script setup lang="ts">
import { computed } from 'vue'
// @ts-ignore
import CircleProgress from 'vue3-circle-progress'

const props = withDefaults(defineProps<{
  percent: number
  size?: number
  scale?: number
  fillColor?: string
}>(), {
  percent: 60,
  size: 100,
  scale: 10,
  fillColor: 'auto',
})

const color = computed(() => {
  if (props.fillColor === 'auto') {
    if (props.percent < 30) {
      return '#23DC52'
    } else if (props.percent < 80) {
      return '#FF9900'
    } else {
      return '#FF5372'
    }
  } else {
    return props.fillColor
  }
})

</script>

<template>
  <div class="relative w-min h-min">
    <CircleProgress
      :percent="percent"
      :size="size"
      :fill-color="color"
      empty-color="#8885"
      :border-width="size/scale"
      :border-bg-width="size/scale"
    />
    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      :style="{
        fontSize: `${size / 2}px`,
      }"
    >
      <!-- Icon slot -->
      <slot></slot>
    </div>
  </div>
</template>