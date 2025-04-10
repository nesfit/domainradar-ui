<script setup lang="ts">
import type { DomainData as Domain } from "~/server/api/domains/index.get"
import Pie from "./Pie.vue"
import MalignIcon from "./MalignIcon.vue"
import { computed, ref } from "vue";
import { percentFormat } from "@/assets/utils"
import latestResults from "~/utils/latestResults";

const props = defineProps<{
  domain: Domain
  active?: boolean
}>()

const emit = defineEmits(["click", "mouseenter", "mouseleave"])

const dominantType = computed(() => {
  const dominant = props.domain.classificationResults
    .reduce((acc, cur) => {
      if (acc.probability > cur.probability) {
        return acc
      } else {
        return { probability: cur.probability, category: cur.category.category }
      }
    }, { probability: 0, category: "" })
  if (dominant.probability > 0.3) {
    return dominant.category
  } else {
    return "Okay"
  }
})

const latestClassificationResults = computed(() => latestResults(props.domain.classificationResults, "timestamp", "category.category"))

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
  <li class="flex items-center gap-2 cursor-pointer px-3 py-1 hover:bg-primary/10" :class="{
    'bg-primary/5': active,
  }" @click="$emit('click', domain)" @mouseenter="onMouseEntered" @mouseleave="onMouseLeft">
    <Pie v-if="typeof domain.aggregate_probability == 'number'" :size="36"
      :percent="domain.aggregate_probability * 100">
      <MalignIcon :type="dominantType" />
    </Pie>
    <div class="overflow-x-hidden">
      <h2 class="whitespace-nowrap truncate text-ellipsis">{{ domain.domain_name }}</h2>
      <ul class="flex gap-2 text-sm">
        <li v-for="result in latestClassificationResults" :key="result.category.category"
          class="flex items-center gap-0.5">
          <MalignIcon :type="result.category.category" /> {{ percentFormat(result.probability) }}
        </li>
        <li class="opacity-50 transition-colors duration-150 flex" :class="{
  'opacity-100 text-accent': isHovered,
}">
          <template v-if="domain.ipAddresses.length < maxIPDots">
            <MdiIcon icon="mdiCircleMedium" v-for="{ ip } in domain.ipAddresses" :key="ip" />
          </template>
          <template v-else-if="domain.ipAddresses.length === maxIPDots">
            <MdiIcon icon="mdiCircleMedium" v-for="i in maxIPDots" :key="i" />
          </template>
          <template v-else>
            <MdiIcon icon="mdiCircleMedium" v-for="i in maxIPDots - 1" :key="i" />
            +{{ domain.ipAddresses.length - (maxIPDots - 1) }}
          </template>
        </li>
      </ul>
    </div>
  </li>
</template>