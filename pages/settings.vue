<script setup lang="ts">
import { Vue3JsonEditor } from 'vue3-json-editor';
import type { ComponentId, ConfigChangeRequest, Configs, Config } from '~/types/config';

definePageMeta(
  {
    middleware: "auth",
    auth: { guestRedirectTo: "/" }
  }
)

const route = useRoute()
const { go } = useRouter()
const { locale, setLocale } = useI18n()

const allowHolo = ref(true)

const configFetchTries = ref(0)
const { data: currentConfig, error: errorFetchingConfigs, refresh: refreshConfigs, pending: loadingConfigs } = await useFetch("/api/kafka/config", {
  lazy: true,
  retry: 12,
  retryDelay: 5000,
  onRequest() {
    configFetchTries.value++
  }
})

const epillepsyFreeLoadingIndicator = ref(true)
let timeout: NodeJS.Timeout
watch(loadingConfigs, () => {
  if (loadingConfigs.value) {
    timeout = setTimeout(() => {
      epillepsyFreeLoadingIndicator.value = true
    }, 100)
  } else {
    clearTimeout(timeout)
    epillepsyFreeLoadingIndicator.value = false
  }
})

const noConfigsReceived = computed(() => currentConfig.value && Object.keys(currentConfig.value).length === 0)
useIntervalFn(() => {
  if (currentConfig.value) {
    refreshConfigs()
  }
}, 5000)

const editableConfigs: Configs = reactive({})

function isSameConfig(a: Config, b: Config) {
  return JSON.stringify(a) === JSON.stringify(b)
}

const lastReceivedConfigs: Configs = {}
watch(currentConfig, () => {
  const cc = currentConfig.value as Configs
  for (const c in cc) {
    const component = c as ComponentId
    if (lastReceivedConfigs[component] && isSameConfig(cc[component]?.currentConfig, lastReceivedConfigs[component])) {
      // skip update if upstream didn't change
      // prevents overwriting user changes
      // but keeps receiving new unseen configs
      continue
    }
    //
    const copy = JSON.parse(JSON.stringify(cc[component]?.currentConfig))
    editableConfigs[component] = copy
    lastReceivedConfigs[component] = copy
  }
  configFetchTries.value = 0
})

const configStatusIcon = computed(() => {
  if (loadingConfigs.value) {
    return 'mdiLoading'
  }
  if (errorFetchingConfigs.value) {
    return 'mdiAlert'
  }
  return 'mdiCheck'
})

async function sendChangeRequest(component: ComponentId) {
  const config = editableConfigs[component]
  if (!config) {
    console.error('No config for component', component)
    return
  }
  const body: ConfigChangeRequest = {
    component,
    config
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

      <h3 class="mt-4 text-lg font-bold">{{ $t('settings.app.links.title') }}</h3>
      <p>{{ $t('settings.app.links.description') }}</p>
      <div class="flex my-2">
        <ObjectConfig class="w-full" get-endpoint="/api/config/links" default-value="https://external.link/%s" />
      </div>

      <h3 class="mt-4 text-lg font-bold">{{ $t('settings.app.prefilterColors.title') }}</h3>
      <p>{{ $t('settings.app.prefilterColors.description') }}</p>
      <div class="flex my-2">
        <ObjectConfig class="w-full" get-endpoint="/api/config/prefiltercolors" default-key="pattern"
          default-value="#facade" value-input-type="color" />
      </div>
    </section>

    <section>
      <h2 class="text-xl font-extrabold">{{ $t('settings.components.title') }}</h2>
      <p>{{ $t('settings.components.description') }}</p>

      <div class="flex gap-2 items-center"><!-- status -->
        <div :class="{ 'animate-spin': loadingConfigs }"><!-- icon -->
          <MdiIcon :icon="configStatusIcon" />
        </div>
        <div><!-- text -->
          <span v-if="errorFetchingConfigs">{{ errorFetchingConfigs }}</span>
          <span v-else-if="noConfigsReceived">
            {{ $t('settings.components.no_configs') }}
          </span>
          <span v-else-if="epillepsyFreeLoadingIndicator">
            <span v-if="configFetchTries > 0" class="flex gap-2 items-center">
              {{ $t('settings.components.retrying', { attempt: configFetchTries }) }}
              <MdiIcon icon="mdiInformationOutline" v-tooltip="$t('settings.components.retrying_explanation')" />
            </span>
            <span v-else>{{ $t('settings.components.loading') }}</span>
          </span>
          <span v-else>{{ $t('settings.components.loaded') }}</span>
        </div>
      </div>

      <section v-for="(config, component) in editableConfigs" class="mt-4">
        <div class="flex justify-between items-center p-2 bg-slate-300 dark:bg-slate-600">
          <h3 class="mx-2 text-lg font-bold capitalize">{{ component }}</h3>
          <HButton @click="tryUpdateConfig(component)" color="accent">{{ $t('save') }}</HButton>
        </div>
        <vue3-json-editor v-model="editableConfigs[component]" mode="code" />
      </section>

    </section>

  </div>
</template>
<style scoped>
.show-after-1s {
  opacity: 0;
  animation: showAfter1s 1s 1s forwards;
}

@keyframes showAfter1s {
  to {
    opacity: 1;
  }
}
</style>