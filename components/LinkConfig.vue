<template>
  <div>
    <ul ref="linkList" class="flex flex-col">
      <li v-for="linkEntry, index in editableLinks" :key="'linkEditorKey' + index" class="grow">
        <div class="grow inline-flex items-center">
          <HInputField v-model="editableLinks[index][0]" />
          <HInputField v-model="editableLinks[index][1]" class="min-w-60" />
          <HButton @click="editableLinks.splice(index, 1)" class="h-7" hollow symmetrical borderless>
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
const linkList = ref<HTMLUListElement | null>(null)
const { data, pending, error, refresh } = await useFetch('/api/config/links')

const editableLinks = ref(Object.entries(data.value || {}))

function add() {
  editableLinks.value.push(['Title', 'https://external.link/d/%s'])
  setTimeout(() => {
    const newRow = linkList.value?.querySelector<HTMLInputElement>('li:last-child input')
    newRow?.focus()
    newRow?.select()
  }, 0)
}

async function save() {
  const { error } = await $fetch('/api/config/links', {
    method: 'PUT',
    body: Object.fromEntries(editableLinks.value)
  })
  if (error) {
    console.error(error)
  }
  refresh()
}
</script>

<style></style>