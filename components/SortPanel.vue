<template>
  <div class="px-4">
    <h1 class="text-lg font-bold">{{ $t('sorting.title') }}</h1>
    <div class="flex flex-col">
      <HRadio v-for="v in sortingOptions" v-model="sortKey" :value="v">{{ $t(v) }}</HRadio>
    </div>
    <div class="my-2 flex flex-col">
      <HCheckbox v-model="sortAsc">{{ $t('sorting.direction.asc') }}</HCheckbox>
    </div>
  </div>
</template>

<script lang="ts" setup>

const filterSortStore = useFilterSortStore()
const { sortAsc, sortKey } = storeToRefs(filterSortStore)

const sortingOptions = ["aggregate_probability", "first_seen", "last_seen", "offense_count"]
</script>

<style></style>