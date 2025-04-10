<template>
  <div class="px-16 py-8 flex flex-col gap-4 max-w-screen-xl">
    <div class="flex items-center gap-2 text-2xl font-black  -ml-8">
      <button @click="go(-1)" :disabled="sending">
        <MdiIcon icon="mdiArrowLeft" :class="{ 'opacity-20': sending }" />
      </button>
      <h1>{{ $t('customCheck.title') }}</h1>
    </div>
    <div>
      <p>
        {{ $t('customCheck.description') }}
      </p>
      <HInputField type="file" accept="text/plain" :label="$t('customCheck.fromFile')" :disabled="sending"
        @input="readFromFile" />
      <HTextArea v-model="domains" :rows="10" :placeholder="$t('customCheck.placeholder')"
        class="w-full font-mono whitespace-pre break-normal overflow-x-scroll" :disabled="sending" />
      <HButton type="submit" @click="addDomains" :disabled="sending || domains === ''">
        {{ sending ? $t('customCheck.sending') : $t('customCheck.submit') }}
      </HButton>

      <HNotification v-model="sent" :timeout="3000">
        <template #title>
          {{ $t('customCheck.title') }}
        </template>
        <template #aside>
          <MdiIcon icon="mdiCheck" class="text-2xl me-2" />
        </template>
        {{ $t('customCheck.sent') }}
      </HNotification>
      <HNotification v-model="errored" :timeout="3000">
        <template #title>
          {{ $t('customCheck.title') }}
        </template>
        <template #aside>
          <MdiIcon icon="mdiAlert" class="text-2xl me-2" />
        </template>
        {{ error }}
      </HNotification>

    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta(
  {
    middleware: "auth",
    auth: { guestRedirectTo: "/" }
  }
)

const { go } = useRouter()
const domains = ref<string>('')
const sending = ref<boolean>(false)
const sent = ref<boolean>(false)
const errored = ref<boolean>(false)
const error = ref<string>('')

function readFromFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    domains.value = reader.result as string
  }
  reader.readAsText(file)
}

async function addDomains() {
  const domainsArray = domains.value.split('\n').map(domain => domain.trim()).filter(Boolean)
  console.log(domainsArray)
  sending.value = true
  try {
    await $fetch('/api/domains/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(domainsArray)
    })
    sent.value = true
    domains.value = ''
  } catch (e: any) {
    console.error(e)
    errored.value = true
    error.value = e.message
  } finally {
    sending.value = false
  }
}
</script>