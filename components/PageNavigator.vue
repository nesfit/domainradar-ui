<script setup lang="ts">
import { usePageStore } from "@/stores/pagination"

const pageStore = usePageStore()
</script>

<template>
  <nav class="flex gap-4 text-xl">
    <button @click="pageStore.setPage(1)" class="disabled:opacity-30" :disabled="pageStore.isFirstPage"
      :title="$t('pagination.first')">
      <MdiIcon icon="mdiSkipPrevious" />
    </button>
    <button @click="pageStore.prevPage" class="disabled:opacity-30" :disabled="pageStore.isFirstPage"
      :title="$t('pagination.prev')">
      <MdiIcon icon="mdiChevronLeft" />
    </button>
    <span class="block w-32 text-center text-base">{{ $t('pagination.page') }} {{ pageStore.page }} {{
      $t('pagination.of') }} {{ pageStore.pageCount }}</span>
    <button @click="pageStore.nextPage" class="disabled:opacity-30" :disabled="pageStore.isLastPage"
      :title="$t('pagination.next')">
      <MdiIcon icon="mdiChevronRight" />
    </button>
    <button @click="pageStore.setPage(pageStore.pageCount)" class="disabled:opacity-30" :disabled="pageStore.isLastPage"
      :title="$t('pagination.last')">
      <MdiIcon icon="mdiSkipNext" />
    </button>
  </nav>
</template>