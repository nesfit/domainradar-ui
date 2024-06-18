import { ref, computed } from "vue"
import { defineStore } from "pinia"

export const usePageStore = defineStore("page", () => {
  const page = ref(1)
  const limit = ref(20)
  const total = ref(0)

  const offset = computed(() => {
    return (page.value - 1) * limit.value
  })

  const pageCount = computed(() => {
    return Math.ceil(total.value / limit.value)
  })

  const isLastPage = computed(() => {
    return page.value === pageCount.value
  })

  const isFirstPage = computed(() => {
    return page.value === 1
  })

  const setLimit = (l: number) => {
    limit.value = l
  }

  const setPage = (p: number) => {
    if (p < 1) {
      page.value = 1
    }
    if (p > pageCount.value) {
      page.value = pageCount.value
    }
    page.value = p
  }

  const setTotal = (t: number) => {
    total.value = t
  }

  const nextPage = () => {
    setPage(page.value + 1)
  }

  const prevPage = () => {
    setPage(page.value - 1)
  }

  return {
    page,
    offset,
    limit,
    pageCount,
    total,
    isFirstPage,
    isLastPage,
    setPage,
    setLimit,
    setTotal,
    prevPage,
    nextPage,
  }
})
