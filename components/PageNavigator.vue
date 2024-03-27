<script setup lang="ts">
import { usePageStore } from "@/stores/pagination"
import ChevronLeft from 'vue-material-design-icons/ChevronLeft.vue'
import ChevronRight from 'vue-material-design-icons/ChevronRight.vue'
import SkipPrevious from 'vue-material-design-icons/SkipPreviousOutline.vue'
import SkipNext from 'vue-material-design-icons/SkipNextOutline.vue'

const pageStore = usePageStore()
</script>

<template>
  <nav class="flex gap-4 text-xl">
    <button @click="pageStore.setPage(1)" class="disabled:opacity-30" :disabled="pageStore.isFirstPage">
      <SkipPrevious />
    </button>
    <button @click="pageStore.prevPage" class="disabled:opacity-30" :disabled="pageStore.isFirstPage">
      <ChevronLeft />
    </button>
    <span class="block w-32 text-center text-base">Page {{ pageStore.page }} of {{ pageStore.pageCount }}</span>
    <button @click="pageStore.nextPage" class="disabled:opacity-30" :disabled="pageStore.isLastPage">
      <ChevronRight />
    </button>
    <button @click="pageStore.setPage(pageStore.pageCount)" class="disabled:opacity-30" :disabled="pageStore.isLastPage">
      <SkipNext />
    </button>
  </nav>
</template>