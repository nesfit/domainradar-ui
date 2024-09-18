<template>
  <div class="px-16 py-8 flex flex-col gap-4 max-w-screen-xl">
    <div class="flex items-center gap-2 text-2xl font-black text-cyan-900 dark:text-cyan-100 -ml-8">
      <button @click="go(-1)" :disabled="sending">
        <MdiIcon icon="mdiArrowLeft" :class="{ 'opacity-20': sending }" />
      </button>
      <h1>{{ $t('customCheck.title') }}</h1>
    </div>
    <div>
      <p>
        {{ $t('customCheck.description') }}
      </p>
      <HTextArea v-model="domains" :rows="10" :placeholder="$t('customCheck.placeholder')" class="font-mono"
        :disabled="sending" />
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