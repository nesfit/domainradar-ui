import { ref, computed } from "vue"
import { defineStore } from "pinia"

export const useFilterSortStore = defineStore("filterSort", () => {
  const sortKey = ref("aggregate_probability")
  const sortAsc = ref(false)
  //
  const filterAggregateProbability = ref([0, 100])
  const filterHighestClassifier = ref<string>("")
  //
  //
  const setSortKey = (key: string) => {
    sortKey.value = key
  }
  const setSortAsc = (asc: boolean) => {
    sortAsc.value = asc
  }
  //
  const setFilterAggregateProbability = (range: [number, number]) => {
    filterAggregateProbability.value = range
  }
  const setFilterHighestClassifier = (classifier: string) => {
    filterHighestClassifier.value = classifier
  }
  //
  return {
    sortKey,
    sortAsc,
    setSortKey,
    setSortAsc,
    //
    filterAggregateProbability,
    filterHighestClassifier,
    setFilterAggregateProbability,
    setFilterHighestClassifier,
  }
})
