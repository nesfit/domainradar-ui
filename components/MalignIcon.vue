<script setup lang="ts">
import Fallback from 'vue-material-design-icons/AlertCircleOutline.vue'
import Phishing from 'vue-material-design-icons/Hook.vue'
import Malware from 'vue-material-design-icons/Bug.vue'
import DGA from 'vue-material-design-icons/Robot.vue'
import Okay from 'vue-material-design-icons/Check.vue'
import { computed } from 'vue';

const props = defineProps<{
  type: string
}>()

const iconMap = new Map([
  ["Phishing", Phishing],
  ["Malware", Malware],
  ["DGA", DGA],
  ["Okay", Okay],
])

const icon = computed(() => {
  return iconMap.has(props.type) ? iconMap.get(props.type) : Fallback
})
</script>

<template>
  <component :is="icon" />
</template>