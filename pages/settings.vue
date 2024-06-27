<script setup lang="ts">
const route = useRoute()
const { go } = useRouter()
const { locale, setLocale } = useI18n()

const allowHolo = ref(true)

const { data: currentConfig, error: errorFetchingConfigs, refresh: refreshConfigs, pending: loadingConfigs } = await useFetch("/api/kafka/config", {
  lazy: true,
})
</script>

<template>
  <div class="px-16 py-8 flex flex-col gap-12">
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

      <section v-for="(config, component) in currentConfig">
        <h3 class="mt-4 text-lg font-bold">{{ component }}</h3>
        <pre class="px-4 bg-slate-200 dark:bg-slate-700"><code>
{{ config.currentConfig }}
        </code></pre>
      </section>

    </section>

  </div>
</template>