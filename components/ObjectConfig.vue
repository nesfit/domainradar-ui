<template>
  <div>
    <ul ref="rowList" class="flex flex-col">
      <li v-for="_, index in editableRows" :key="'rowEditorKey' + index" class="grow">
        <div class="grow inline-flex items-center">
          <HInputField v-model="editableRows[index][0]" />
          <HInputField v-model="editableRows[index][1]" class="min-w-96" :type="valueInputType" />
          <HButton @click="editableRows.splice(index, 1)" class="h-7" hollow symmetrical borderless>
            <MdiIcon icon="mdiWindowClose" class="text-lg" />
          </HButton>
        </div>
      </li>
    </ul>
    <HButton @click="add" symmetrical>
      <MdiIcon icon="mdiPlus" />
    </HButton>
    <HButton @click="save" symmetrical>
      <MdiIcon icon="mdiFloppy" />
    </HButton>
  </div>
</template>

<script lang="ts" setup>
const props = withDefaults(defineProps<{
  getEndpoint: string,
  putEndpoint?: string | null,
  defaultKey?: string,
  defaultValue?: string,
  valueInputType?: string
}>(), {
  defaultKey: 'Title',
  defaultValue: '...',
  valueInputType: 'text'
})

const actualPut = computed(() => props.putEndpoint || props.getEndpoint)

const rowList = ref<HTMLUListElement | null>(null)
const { data, pending, error, refresh } = await useFetch(props.getEndpoint)

const editableRows = ref(Object.entries(data.value || {}))

function add() {
  editableRows.value.push([props.defaultKey, props.defaultValue])
  setTimeout(() => {
    const newRow = rowList.value?.querySelector<HTMLInputElement>('li:last-child input')
    newRow?.focus()
    newRow?.select()
  }, 0)
}

async function save() {
  // @ts-ignore
  const { error } = await $fetch(actualPut.value, {
    method: 'PUT',
    body: Object.fromEntries(editableRows.value)
  })
  if (error) {
    console.error(error)
  }
  refresh()
}
</script>

<style>
input[type=color] {
  height: 2em !important;
  padding: 0 .1em;
}
</style>