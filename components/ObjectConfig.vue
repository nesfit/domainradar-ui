<template>
  <div>
    <ul ref="rowList" class="flex flex-col">
      <li v-for="_, index in editableRows" :key="'rowEditorKey' + index" class="grow">
        <div class="grow inline-flex items-center">
          <HInputField v-model="editableRows[index][0]" :color="validColor(validations[index][0])" />
          <HInputField v-model="editableRows[index][1]" class="min-w-96" :type="valueInputType"
            :color="validColor(validations[index][1])" />
          <HButton @click="editableRows.splice(index, 1)" class="h-7" hollow symmetrical borderless>
            <MdiIcon icon="mdiWindowClose" class="text-lg" />
          </HButton>
        </div>
        <div class="text-sm text-destructive px-2">
          <span :color="validColor(validations[index][0])">{{ validations[index][0]?.message }}</span>
          <span :color="validColor(validations[index][1])">{{ validations[index][1]?.message }}</span>
        </div>
        <div>

        </div>
      </li>
    </ul>
    <HButton @click="add" symmetrical>
      <MdiIcon icon="mdiPlus" />
    </HButton>
    <HButton @click="save" symmetrical :disabled="!savingEnabled">
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
  keyValidator?: (key: string) => Error | null
  valueValidator?: (value: any) => Error | null
  allowSaving?: "always" | "some-valid" | "all-valid"
}>(), {
  defaultKey: 'Title',
  defaultValue: '...',
  valueInputType: 'text',
  keyValidator: () => null,
  valueValidator: () => null,
  allowSaving: 'all-valid'
})

const actualPut = computed(() => props.putEndpoint || props.getEndpoint)

const rowList = ref<HTMLUListElement | null>(null)
const { data, pending, error, refresh } = await useFetch(props.getEndpoint)

const editableRows = ref(Object.entries(data.value || {}))

const validations = computed(() => editableRows.value.map(([key, value]) => {
  const keyError = props.keyValidator(key)
  const valueError = props.valueValidator(value)
  return [keyError, valueError]
}))

const allValid = computed(() => validations.value.every(([keyError, valueError]) => !keyError && !valueError))
const someValid = computed(() => validations.value.some(([keyError, valueError]) => !keyError && !valueError))

const savingEnabled = computed(() => {
  switch (props.allowSaving) {
    case 'always':
      return true
    case 'some-valid':
      return someValid.value
    case 'all-valid':
      return allValid.value
  }
})

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

function validColor(error: Error | null) {
  return error ? 'destructive' : 'foreground'
}
</script>

<style>
input[type=color] {
  height: 2em !important;
  padding: 0 .1em;
}
</style>