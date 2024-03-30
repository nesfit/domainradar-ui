<script setup lang="ts">
import { usePageStore } from "@/stores/pagination"

const pageStore = usePageStore()
</script>

<template>
  <nav class="flex gap-4 text-xl">
    <button @click="pageStore.setPage(1)" class="disabled:opacity-30" :disabled="pageStore.isFirstPage">
      <MdiIcon icon="mdiSkipPrevious" />
    </button>
    <button @click="pageStore.prevPage" class="disabled:opacity-30" :disabled="pageStore.isFirstPage">
      <MdiIcon icon="mdiChevronLeft" />
    </button>
    <span class="block w-32 text-center text-base">Page {{ pageStore.page }} of {{ pageStore.pageCount }}</span>
    <button @click="pageStore.nextPage" class="disabled:opacity-30" :disabled="pageStore.isLastPage">
      <MdiIcon icon="mdiChevronRight" />
    </button>
    <button @click="pageStore.setPage(pageStore.pageCount)" class="disabled:opacity-30"
      :disabled="pageStore.isLastPage">
      <MdiIcon icon="mdiSkipNext" />
    </button>
  </nav>
</template>