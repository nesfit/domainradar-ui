<script setup lang="ts">
import { usePageStore } from "@/stores/pagination"

const pageStore = usePageStore()
const jumpMode = ref(false)
const jumpTarget = ref(1)

function enableJumpMode() {
  jumpTarget.value = pageStore.page
  jumpMode.value = true
}

function jump() {
  if (!jumpMode.value) return
  pageStore.setPage(jumpTarget.value)
  jumpMode.value = false
}

onKeyStroke("Enter", jump)
</script>

<template>
  <nav class="flex gap-4 text-xl" v-if="!jumpMode">
    <button @click="pageStore.setPage(1)" class="disabled:opacity-30" :disabled="pageStore.isFirstPage"
      :title="$t('pagination.first')">
      <MdiIcon icon="mdiSkipPrevious" />
    </button>
    <button @click="pageStore.prevPage" class="disabled:opacity-30" :disabled="pageStore.isFirstPage"
      :title="$t('pagination.prev')">
      <MdiIcon icon="mdiChevronLeft" />
    </button>
    <span class="block w-32 text-center text-base">
      {{ $t('pagination.page') }}
      <button class="font-bold" @click="enableJumpMode">{{ pageStore.page }}</button>
      {{ $t('pagination.of') }}
      {{ pageStore.pageCount }}
    </span>
    <button @click="pageStore.nextPage" class="disabled:opacity-30" :disabled="pageStore.isLastPage"
      :title="$t('pagination.next')">
      <MdiIcon icon="mdiChevronRight" />
    </button>
    <button @click="pageStore.setPage(pageStore.pageCount)" class="disabled:opacity-30" :disabled="pageStore.isLastPage"
      :title="$t('pagination.last')">
      <MdiIcon icon="mdiSkipNext" />
    </button>
  </nav>
  <nav class="flex gap-2 text-md" v-else>
    <button @click="jumpMode = false">
      <MdiIcon icon="mdiClose" />
    </button>
    <HInputField hollow type="number" v-model="jumpTarget" class="w-16" :min="1" :max="pageStore.pageCount" />
    <button @click="jump">
      <MdiIcon icon="mdiArrowRight" />
    </button>
  </nav>
</template>