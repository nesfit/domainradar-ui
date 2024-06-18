<template>
  <div class="px-4">
    <h1 class="text-lg font-bold mb-2">{{ $t('filter.title') }}</h1>
    <div class="flex flex-col gap-4">
      <div class="flex flex-col">
        <div class="flex justify-between">
          <h2 class="font-medium">{{ $t('filter.aggregate_probability.title') }}</h2>
          <MdiIcon icon="mdiInformationOutline" v-tooltip="$t('filter.aggregate_probability.description')" />
        </div>
        <HRangeSlider v-model="filterAggregateProbability" color="destructive" />
        <div class="flex justify-between text-xs">
          <span>min: {{ filterAggregateProbability[0] }}</span>
          <span>max: {{ filterAggregateProbability[1] }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>

const filterSortStore = useFilterSortStore()
const { filterAggregateProbability, filterHighestClassifier } = storeToRefs(filterSortStore)

const classifiers = ["phishing", "malware", "dga"]
</script>

<style></style>