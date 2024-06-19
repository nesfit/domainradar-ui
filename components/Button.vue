<script lang="ts" setup>
const props = defineProps<{
  href?: string
  to?: any
  disabled?: boolean
  color?: string
}>()

const isExternalLink = computed(() => {
  return props.href?.startsWith("http")
})

const componentType = computed(() => {
  if (props.href) {
    return "a"
  } else if (props.to) {
    return resolveComponent("NuxtLink")
  } else {
    return "div"
  }
})
</script>

<template>
  <component :is="componentType" :disabled="props.disabled" :href="href" :to="to">
    <HButton :disabled="props.disabled" v-bind="$attrs" class="h-8 m-0" :color="color">
      <slot />
      <MdiIcon icon="mdiOpenInNew" v-if="isExternalLink" class="ml-1" />
    </HButton>
  </component>
</template>