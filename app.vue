<script setup lang="ts">
import { HoloWrapper, HoloRainEffect } from 'holo-vue';
const { locale, setLocale } = useI18n()
const preferences = usePreferencesStore()

// Load preferences from localStorage on app start
onMounted(() => {
  preferences.loadFromStorage()
})
</script>
<template>
  <HRoot :uses-system-appearance="preferences.theme === 'system'"
        :dark-appearance="preferences.theme === 'dark'"
        :no-holograms="!preferences.allowHolo"
        theme-dark="radar-dark"
        theme-light="radar-light">
    <HoloWrapper class="main-header" block color="accent" :options="{
    rows: 1,
    duration: {
      rise: 1,
      fall: 20,
    },
    color: {
      peakAlpha: 0.25
    }
  }">
      <template #effects="{ renderer }">
        <HoloRainEffect :renderer="renderer" :options="{ propagate: false, interval: 1 }" />
      </template>
      <header class="px-6 py-3 w-full h-16 flex justify-between items-center">
        <NuxtLink to="/app" class="flex items-center gap-2 text-cyan-900 dark:text-cyan-100 cursor-pointer">
          <DomainRadarLogo class="w-8" />
          <strong class="text-lg">DomainRadar</strong>
        </NuxtLink>
        <div class="flex items-center gap-4">
          <!-- <span class="text-sm text-cyan-800 dark:text-cyan-200 pointer-events-none">
            {{ $t('up_to_date') }}
            <div class="dot"></div>
          </span> -->
          <NuxtLink class="text-cyan-900 dark:text-cyan-100 text-2xl" to="/prefiltered"
            v-tooltip="$t('prefiltered.title')">
            <MdiIcon icon="mdiFilterCheckOutline" />
          </NuxtLink>
          <NuxtLink class="text-cyan-900 dark:text-cyan-100 text-2xl" to="/custom-check"
            v-tooltip="$t('customCheck.title')">
            <MdiIcon icon="mdiWebPlus" />
          </NuxtLink>
          <span>&middot;</span>
          <button @click="setLocale(locale === 'en' ? 'cs' : 'en')"
            class="uppercase h-7 font-semibold text-cyan-900 dark:text-cyan-100"
            v-tooltip="$t('settings.app.language.title')">{{ locale }}
          </button>
          <NuxtLink class="text-cyan-900 dark:text-cyan-100 text-2xl" to="/settings" v-tooltip="$t('settings.title')">
            <MdiIcon icon="mdiTune" />
          </NuxtLink>
          <NuxtLink class="text-cyan-900 dark:text-cyan-100 text-2xl" to="/" v-tooltip="$t('exit')"
            v-if="$route.path !== '/'">
            <MdiIcon icon="mdiExitRun" />
          </NuxtLink>
        </div>
      </header>
    </HoloWrapper>
    <NuxtPage />
    <div id="holoteleports" class="fixed z-[9999]"></div>
  </HRoot>
</template>

<style>
body {
  background-color: #abd3df;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #213552;
  }
}

.main-header {
  background-color: hsl(var(--background) / 80%);
}

.dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: #23DC52;
  border: 2px solid #13AC32;
  display: inline-block;
}
.page-leave-active,
.page-out-leave-active {
  transition: transform 0.4s cubic-bezier(0.32, 0, 0.67, 0), opacity 0.3s;
}

.page-enter-active {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s;
}

.page-enter-from,
.page-leave-to,
.page-out-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
