<script setup lang="ts">
const route = useRoute()
const { signIn, signOut, session, status, cookies, getProviders } = useAuth()
const signedIn = computed(() => status.value === 'authenticated')
const name = computed(() => session.value?.user?.name)
const email = computed(() => session.value?.user?.email)
</script>

<template>
  <div class="absolute -z-10 w-dvw h-dvh top-0 pt-16 flex justify-center items-center bg-slate-200 dark:bg-slate-700">
    <div class="relative max-w-max p-6 bg-slate-300 dark:bg-slate-600">
      <h1 class="text-2xl">
        {{ $t(signedIn ? 'auth_msg.authenticated' : 'auth_msg.guest', { name }) }}
      </h1>
      <h2 v-if="signedIn" class="mb-6">{{ email }}</h2>
      <HButton @click="signedIn ? $router.push('/app') : signIn()" color="accent">
        {{ $t(signedIn ? 'open_app' : 'sign_in') }}
      </HButton>
      <HButton v-if="signedIn" @click="signOut()" hollow>{{ $t('sign_out') }}</HButton>
    </div>
  </div>
</template>