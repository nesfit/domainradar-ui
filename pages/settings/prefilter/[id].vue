<template>
  <div class="px-16 py-8 flex flex-col gap-12 max-w-screen-xl">
    <div class="flex items-center gap-2 text-2xl font-black  -ml-8">
      <NuxtLink to="/settings">
        <MdiIcon icon="mdiArrowLeft" />
      </NuxtLink>
      <h1>{{ $t('settings.title') }} / {{ $t('settings.prefilter.title') }}</h1>
    </div>
    <div class="flex flex-col gap-4" v-if="data">
      <div class="flex items-center gap-2">
        <MdiIcon icon="mdiFilter" />
        <h2 class="text-xl font-bold">{{ data.name }}</h2>
      </div>
      <div class="font-bold">{{ $t('settings.prefilter.action') }}: {{
        $t(`settings.prefilter.actions.${getAction(data.action)}`)
        }}</div>
      <p v-if="data.description">
        {{ data.description }}
      </p>
      <div class="flex">
        <PrefilterEditor :init="dataWithoutDomains" @update="refresh" />
        <Modal>
          <template #trigger="{ state }">
            <HButton color="destructive" @click="state.open = true">{{ $t('delete') }}</HButton>
          </template>
          <template #default="{ state }">
            <p>{{ $t('delete') }} {{ data.name }}. {{ $t('confirmation') }}</p>
            <div class="flex justify-between gap-4">
              <HButton color="destructive" @click="deletePrefilter">{{ $t('delete') }}</HButton>
              <HButton @click="state.open = false">{{ $t('cancel') }}</HButton>
            </div>
          </template>
        </Modal>
      </div>

      <h3 class="text-lg font-bold mt-4">{{ $t('domains') }}</h3>
      <p>{{ $t('settings.prefilter.domains_desc') }}</p>
      <div class="flex">
        <HButton @click="save" color="accent"
          :disabled="domainsCommands.add.length <= 0 && domainsCommands.remove.length <= 0">{{ $t('save') }}</HButton>
      </div>
      <ul>
        <li v-for="domain in data.domains" :key="domain.domain_name">
          <HButton symmetrical hollow borderless color="destructive" @click="setRemovalStatus(domain.domain_name)">
            <MdiIcon icon="mdiClose" />
          </HButton>
          <span :class="{
            'text-red-500 line-through': domainsCommands.remove.includes(domain.domain_name)
          }">{{ domain.domain_name }}</span>
        </li>
        <li v-for="domain in domainsCommands.add" :key="domain">
          <HButton symmetrical hollow borderless color="destructive" @click="cancelAddDomain(domain)">
            <MdiIcon icon="mdiClose" />
          </HButton>
          <span class="text-green-500">{{ domain }}</span>
        </li>
      </ul>
      <div class="flex gap-4 items-end">
        <HInputField v-model="newDomain" :label="$t('settings.prefilter.add_domain')"
          @keypress.enter="addDomains([newDomain])" />
        <HButton @click="addDomains([newDomain])">{{ $t('add') }}</HButton>
      </div>
      <div>
        <HInputField type="file" :label="$t('customCheck.fromFile')" @change="addFromFile" accept="text/plain" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta(
  {
    middleware: "auth",
    auth: { guestRedirectTo: "/" }
  }
)

const { params } = useRoute()
const prefilterId = parseInt(params.id as string)

const { data, error, refresh } = await useFetch(`/api/prefilter/${prefilterId}`)

const dataWithoutDomains = computed(() => {
  if (!data.value) return undefined
  return {
    id: data.value.id,
    name: data.value.name,
    action: data.value.action,
    description: data.value.description,
    enabled: data.value.enabled
  }
})

function getAction(action: number) {
  switch (action) {
    case 0:
      return "pass"
    case 1:
      return "drop"
    case 2:
      return "store"
    default:
      return "unknown"
  }
}

const newDomain = ref<string>("")

const domainsCommands = reactive<{
  id: number
  add: string[]
  remove: string[]
}>({
  id: prefilterId,
  add: [],
  remove: []
})

function setRemovalStatus(domainName: string) {
  if (!domainsCommands.remove.includes(domainName)) {
    domainsCommands.remove.push(domainName)
  } else {
    domainsCommands.remove = domainsCommands.remove.filter((domain) => domain !== domainName)
  }
}

function addDomains(domainNames: string[]) {
  domainsCommands.add = [...domainsCommands.add, ...domainNames.filter((domain) => domain.length > 0).filter((domain) => !domainsCommands.add.includes(domain))]
}
function cancelAddDomain(domainName: string) {
  domainsCommands.add = domainsCommands.add.filter((domain) => domain !== domainName)
}

function addFromFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const content = reader.result as string
    const domains = content.split("\n").map((line) => line.trim()).filter((line) => line.length > 0)
    addDomains(domains)
  }
  reader.readAsText(file)
}

async function save() {
  await $fetch("/api/prefilter/domains", {
    method: "PATCH",
    body: domainsCommands
  })
  await refresh()
  domainsCommands.add = []
  domainsCommands.remove = []
}

async function deletePrefilter() {
  await $fetch(`/api/prefilter/${prefilterId}`, {
    method: "DELETE"
  })
  await useRouter().push("/settings")
}
</script>