<template>
  <div class="px-4">
    <h1 class="text-lg font-bold">{{ $t('sorting.title') }}</h1>
    <div class="flex flex-col">
      <HRadio v-for="v, k in sortingOptions" v-model="sortKey" :value="v">{{ $t(k) }}</HRadio>
    </div>
    <div class="my-2 flex flex-col">
      <HCheckbox v-model="sortAsc" :disabled="ascendingNotAllowed">{{ $t('sorting.direction.asc') }}</HCheckbox>
    </div>
  </div>
</template>

<script lang="ts" setup>

const filterSortStore = useFilterSortStore()
const { sortAsc, sortKey, sortName } = storeToRefs(filterSortStore)

const sortingOptions = {
  "aggregate_probability": "aggregate_probability",
  "phishing_probability": "phishing_probability",
  "malware_probability": "malware_probability",
  "dga_probability": "dga_probability",
  "last_update": "last_update",
  // "offense_count": "",
  "ip_count": "ipAddresses._count",
}

const workaroundQueries = [
  "phishing_probability",
  "malware_probability",
  "dga_probability",
]

const ascendingNotAllowed = computed(() => {
  return workaroundQueries.includes(sortKey.value)
})

// update the sort name when the sort key changes and disable the ascending checkbox for certain keys
watch(sortKey, () => {
  // @ts-ignore
  sortName.value = Object.keys(sortingOptions).find((k) => sortingOptions[k] === sortKey.value) || ''
  if (ascendingNotAllowed.value) {
    sortAsc.value = false
  }
})
</script>

<style></style>