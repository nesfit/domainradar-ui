<script setup lang="ts">
import { usePageStore } from "@/stores/pagination"

const props = defineProps<{
  refreshing: boolean
  paginator?: string
}>()

const paginator = computed(() => props.paginator || "default")
const pageStore = usePageStore()
const jumpMode = ref(false)
const jumpTarget = ref(1)

const pageCount = computed(() => pageStore.pageCount(paginator.value).value == 0 ? '...' : pageStore.pageCount(paginator.value).value)

function enableJumpMode() {
  jumpTarget.value = pageStore.page(paginator.value).value
  jumpMode.value = true
}

function jump() {
  if (!jumpMode.value) return
  pageStore.setPage(jumpTarget.value, paginator.value)
  jumpMode.value = false
}

onKeyStroke("Enter", jump)
</script>

<template>
  <nav class="flex gap-4 text-xl" v-if="!jumpMode">
    <button @click="pageStore.setPage(1, paginator)" class="disabled:opacity-30"
      :disabled="pageStore.isFirstPage(paginator).value" :title="$t('pagination.first')">
      <MdiIcon icon="mdiSkipPrevious" />
    </button>
    <button @click="pageStore.prevPage(paginator)" class="disabled:opacity-30"
      :disabled="pageStore.isFirstPage(paginator).value" :title="$t('pagination.prev')">
      <MdiIcon icon="mdiChevronLeft" />
    </button>
    <span class="block w-32 text-center text-sm">
      {{ $t('pagination.page') }}
      <button class="font-bold" @click="enableJumpMode">{{ pageStore.page(paginator).value }}</button>
      {{ $t('pagination.of') }}
      <span v-if="!refreshing">{{ pageCount }}</span>
      <span v-else class="inline-flex animate-spin ml-1">
        <MdiIcon icon="mdiLoading" class="inline-block" />
      </span>
    </span>
    <button @click="pageStore.nextPage(paginator)" class="disabled:opacity-30"
      :disabled="pageStore.isLastPage(paginator).value" :title="$t('pagination.next')">
      <MdiIcon icon="mdiChevronRight" />
    </button>
    <button @click="pageStore.setPage(pageStore.pageCount(paginator).value, paginator)" class="disabled:opacity-30"
      :disabled="pageStore.isLastPage(paginator).value" :title="$t('pagination.last')">
      <MdiIcon icon="mdiSkipNext" />
    </button>
  </nav>
  <nav class="flex gap-2 text-md" v-else>
    <button @click="jumpMode = false">
      <MdiIcon icon="mdiClose" />
    </button>
    <HInputField hollow type="number" v-model="jumpTarget" class="w-16" :min="1"
      :max="pageStore.pageCount(paginator).value" />
    <button @click="jump">
      <MdiIcon icon="mdiArrowRight" />
    </button>
  </nav>
</template>