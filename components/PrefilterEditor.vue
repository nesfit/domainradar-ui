<template>
  <Modal show-close>
    <template #trigger="{ state }">
      <HButton @click="state.open = !state.open" color="accent">{{ init.id ? $t('settings.prefilter.edit_filter') :
        $t('settings.prefilter.add_filter') }}
      </HButton>
    </template>
    <template #default="{ state }">
      <h1 class="text-lg -mt-8 mb-4">{{ init.id ? $t('settings.prefilter.edit_filter') :
        $t('settings.prefilter.add_filter') }}</h1>
      <form class="appearance-none flex flex-col gap-2">
        <HInputField v-model="config.name" :label="$t('name') + '*'" required color="accent" />
        <HCheckbox class="mx-1.5" v-model="config.enabled">{{ $t('enabled') }}</HCheckbox>
        <div>
          <h4 class="text-sm mx-1.5">{{ $t('settings.prefilter.action') }}</h4>
          <div class="flex">
            <HButton type="button" @click="config.action = 0" :color="config.action === 0 ? 'accent' : 'foreground'">
              <MdiIcon icon="mdiCheck" v-show="config.action === 0" class="mr-2" />
              {{ $t('settings.prefilter.actions.pass') }}
            </HButton>
            <HButton type="button" @click="config.action = 1" :color="config.action === 1 ? 'accent' : 'foreground'">
              <MdiIcon icon="mdiCheck" v-show="config.action === 1" class="mr-2" />
              {{ $t('settings.prefilter.actions.drop') }}
            </HButton>
            <HButton type="button" @click="config.action = 2" :color="config.action === 2 ? 'accent' : 'foreground'">
              <MdiIcon icon="mdiCheck" v-show="config.action === 2" class="mr-2" />
              {{ $t('settings.prefilter.actions.store') }}
            </HButton>
          </div>
        </div>
        <HInputField v-model="config.description" :label="$t('description')" />
        <div class="flex justify-end">
          <HButton type="button" @click="upsert(state)" color="accent"
            :disabled="!config.name || config.name.length <= 0">{{
              $t('save') }}
          </HButton>
        </div>
      </form>
    </template>
  </Modal>
</template>

<script lang="ts" setup>
import type { CustomPrefilter } from '~/server/api/prefilter/index.put';

const emit = defineEmits(['update'])

const props = withDefaults(defineProps<{
  init?: CustomPrefilter
}>(), {
  init: () => ({
    name: "",
    action: 0,
    enabled: true
  })
});

const config = reactive<CustomPrefilter>({
  ...props.init
});

async function upsert(state?: { open: boolean }) {
  const newFilter = await $fetch("/api/prefilter", {
    method: "PUT",
    body: config
  })
  if (!config.id) {
    useRouter().push(`/settings/prefilter/${newFilter.id}`)
  } else {
    emit('update')
  }
  if (state) {
    state.open = false
  }
}
</script>

<style></style>