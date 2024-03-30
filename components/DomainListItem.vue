<script setup lang="ts">
import type { Domain } from "@/types/dr"
import Pie from "./Pie.vue"
import MalignIcon from "./MalignIcon.vue"
import { computed, ref } from "vue";
import { percentFormat } from "@/assets/utils"

const props = defineProps<{
  domain: Domain
  active?: boolean
}>()

const emit = defineEmits(["click", "mouseenter", "mouseleave"])

const dominantType = computed(() => {
  const dominant = props.domain.classification_results
    .reduce((acc, cur) => {
      if (acc.probability > cur.probability) {
        return acc
      } else {
        return cur
      }
    })
  if (dominant.probability > 0.3) {
    return dominant.classifier
  } else {
    return "Okay"
  }
})

const isHovered = ref(false)

function onMouseEntered() {
  emit("mouseenter", props.domain)
  isHovered.value = true
}

function onMouseLeft() {
  emit("mouseleave", props.domain)
  isHovered.value = false
}

const maxIPDots = 4
</script>

<template>
  <li
    class="flex items-center gap-2 cursor-pointer px-3 py-1 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600"
    :class="{
      'bg-slate-200 dark:bg-slate-700': props.active,
    }"
    @click="$emit('click', props.domain)"
    @mouseenter="onMouseEntered"
    @mouseleave="onMouseLeft"
  >
    <Pie :size="36" :percent="props.domain.aggregate_probability * 100">
      <MalignIcon :type="dominantType" />
    </Pie>
    <div class="overflow-x-hidden">
      <h2 class="whitespace-nowrap truncate text-ellipsis">{{ props.domain.domain_name }}</h2>
      <ul class="flex gap-2 text-sm">
        <li v-for="result in props.domain.classification_results" :key="result.classifier">
          <MalignIcon :type="result.classifier" /> {{ percentFormat(result.probability) }}
        </li>
        <li
          class="opacity-50 transition-colors duration-150"
          :class="{
            'opacity-100 text-pink-600': isHovered,
          }"
        >
          <template v-if="props.domain.ip_addresses.length < maxIPDots">
            <Dot v-for="{ip} in props.domain.ip_addresses" :key="ip" />
          </template>
          <template v-else-if="props.domain.ip_addresses.length === maxIPDots">
            <Dot v-for="i in maxIPDots" :key="i" />
          </template>
          <template v-else>
            <Dot v-for="i in maxIPDots - 1" :key="i" />
            +{{ props.domain.ip_addresses.length - (maxIPDots - 1) }}
          </template>
        </li>
      </ul>
    </div>
  </li>
</template>