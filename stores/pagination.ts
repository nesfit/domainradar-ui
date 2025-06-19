import { ref, computed } from "vue"
import { defineStore } from "pinia"

export const usePageStore = defineStore("page", () => {
  // Store state for multiple paginators by name
  const paginators = ref<Record<string, {
    page: number
    limit: number
    total: number
  }>>({
    default: { page: 1, limit: 20, total: 0 }
  })

  function getState(name = "default") {
    if (!paginators.value[name]) {
      paginators.value[name] = { page: 1, limit: 20, total: 0 }
    }
    return paginators.value[name]
  }

  const page = (name = "default") => computed({
    get: () => getState(name).page,
    set: (v: number) => { getState(name).page = v }
  })
  const limit = (name = "default") => computed({
    get: () => getState(name).limit,
    set: (v: number) => { getState(name).limit = v }
  })
  const total = (name = "default") => computed({
    get: () => getState(name).total,
    set: (v: number) => { getState(name).total = v }
  })
  const offset = (name = "default") => computed(() => (getState(name).page - 1) * getState(name).limit)
  const pageCount = (name = "default") => computed(() => Math.ceil(getState(name).total / getState(name).limit))
  const isLastPage = (name = "default") => computed(() => getState(name).page === pageCount(name).value)
  const isFirstPage = (name = "default") => computed(() => getState(name).page === 1)

  function setLimit(l: number, name = "default") {
    getState(name).limit = l
  }
  function setPage(p: number, name = "default") {
    if (p < 1) {
      getState(name).page = 1
    } else if (p > pageCount(name).value) {
      getState(name).page = pageCount(name).value
    } else {
      getState(name).page = p
    }
  }
  function setTotal(t: number, name = "default") {
    getState(name).total = t
  }
  function nextPage(name = "default") {
    setPage(getState(name).page + 1, name)
  }
  function prevPage(name = "default") {
    setPage(getState(name).page - 1, name)
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
