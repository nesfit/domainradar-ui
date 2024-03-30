<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  type: string
}>()

const iconMap = new Map([
  ["Phishing", "mdiHook"],
  ["Malware", "mdiBug"],
  ["DGA", "mdiRobot"],
  ["Okay", "mdiCheck"],
])

const icon = computed(() => {
  return iconMap.get(props.type) || 'mdiAlertCircleOutline'
})
</script>

<template>
  <!-- @vue-ignore the icon attr has a type of union of mdiSomething.. literals and I can't be bothered to typecast the map returns to literals -->
  <MdiIcon :icon="icon" />
</template>