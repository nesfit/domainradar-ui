<script setup lang="ts">
import { Vue3JsonEditor } from 'vue3-json-editor';
import type { ComponentId, ConfigChangeRequest } from '~/types/config';

const route = useRoute()
const { go } = useRouter()
const { locale, setLocale } = useI18n()

const allowHolo = ref(true)

const { data: currentConfig, error: errorFetchingConfigs, refresh: refreshConfigs, pending: loadingConfigs } = await useFetch("/api/kafka/config", {
  lazy: true,
})

const editableConfigs: Record<string, object> = reactive({})

watch(currentConfig, () => {
  for (const component in currentConfig.value) {
    editableConfigs[component] = JSON.parse(JSON.stringify(
      currentConfig.value[component].currentConfig
    ))
  }
})

async function sendChangeRequest(component: ComponentId) {
  const body: ConfigChangeRequest = {
    component,
    config: editableConfigs[component],
  }
  const { error } = await $fetch("/api/kafka/config", {
    method: 'PUT',
    body
  })
  if (error) {
    console.error(error)
  }
}

async function waitForComponentResponse(component: ComponentId) {
  const { data, error } = await $fetch(`/api/kafka/config/${component}`)
  if (error) {
    if (error.value?.message === 'timeout') {
      console.error('Timeout while waiting for component response')
    } else {
      console.error(error)
    }
  }
  return data
}

async function tryUpdateConfig(component: ComponentId) {
  try {
    const promises = [
      sendChangeRequest(component),
      waitForComponentResponse(component)
    ]
    const [sent, response] = await Promise.all(promises)
    return response
  } catch (error) {
    console.error(error)
  } finally {
    refreshConfigs()
  }
}
</script>

<template>
  <div class="px-16 py-8 flex flex-col gap-12 max-w-screen-xl">
    <div class="flex items-center gap-2 text-2xl font-black text-cyan-900 dark:text-cyan-100 -ml-8">
      <button @click="go(-1)">
        <MdiIcon icon="mdiArrowLeft" />
      </button>
      <h1>{{ $t('settings.title') }}</h1>
    </div>

    <section>
      <h2 class="text-xl font-extrabold">{{ $t('settings.app.title') }}</h2>
      <p>{{ $t('settings.app.description') }}</p>

      <h3 class="mt-4 text-lg font-bold">{{ $t('settings.app.language.title') }}</h3>
      <p>{{ $t('settings.app.language.description') }}</p>
      <div class="flex my-2">
        <HButton @click="setLocale('en')" :color="locale === 'en' ? 'accent' : 'foreground'">
          <MdiIcon icon="mdiCheck" v-show="locale === 'en'" class="mr-2" />
          🇬🇧 English
        </HButton>
        <HButton @click="setLocale('cs')" :color="locale === 'cs' ? 'accent' : 'foreground'">
          <MdiIcon icon="mdiCheck" v-show="locale === 'cs'" class="mr-2" />
          🇨🇿 Čeština
        </HButton>
      </div>

      <h3 class="mt-4 text-lg font-bold">{{ $t('settings.app.theme.title') }}</h3>
      <p>{{ $t('settings.app.theme.description') }}</p>
      <div class="flex my-2">
        <HButton color="accent">
          <MdiIcon icon="mdiCheck" v-show="true" class="mr-2" />
          {{ $t('settings.app.theme.system') }}
        </HButton>
        <HButton color="foreground" disabled>
          {{ $t('settings.app.theme.light') }}
        </HButton>
        <HButton color="foreground" disabled>
          {{ $t('settings.app.theme.dark') }}
        </HButton>
      </div>
      <HCheckbox class="mx-1.5" v-model="allowHolo" disabled>{{ $t('settings.app.theme.allow_holo') }}</HCheckbox>
    </section>

    <section>
      <h2 class="text-xl font-extrabold">{{ $t('settings.components.title') }}</h2>
      <p>{{ $t('settings.components.description') }}</p>

      <div><!-- status -->
        <p v-if="loadingConfigs">{{ $t('settings.components.loading') }}</p>
        <p v-if="errorFetchingConfigs">{{ errorFetchingConfigs }}</p>
      </div>

      <section v-for="(config, component) in editableConfigs" class="mt-4">
        <div class="flex justify-between items-center p-2 bg-slate-300 dark:bg-slate-600">
          <h3 class="mx-2 text-lg font-bold capitalize">{{ component }}</h3>
          <HButton @click="tryUpdateConfig(component)" color="accent">{{ $t('save') }}</HButton>
        </div>
        <vue3-json-editor v-model="editableConfigs[component]" />
      </section>

    </section>

  </div>
</template>