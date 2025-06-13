<script setup lang="ts">
const { user, loggedIn, fetch: fetchSession } = useUserSession()

async function signOut() {
  await $fetch('/api/auth/logout', { method: 'POST' })

  // Refresh session to get updated state
  await fetchSession()
}
</script>

<template>
  <div class="absolute -z-10 w-dvw h-dvh top-0 pt-16 flex justify-center items-center bg-holo-bg">
    <div class="relative max-w-max p-6 bg-primary/10">
      <h1 class="text-2xl mb-2">
        {{ $t(loggedIn ? 'auth_msg.authenticated' : 'auth_msg.guest', { name: user?.name }) }}
      </h1>
      <HButton @click="loggedIn ? $router.push('/app') : $router.push('/login')" color="accent">
        {{ $t(loggedIn ? 'open_app' : 'sign_in') }}
      </HButton>
      <HButton v-if="loggedIn" @click="signOut()" hollow>{{ $t('sign_out') }}</HButton>
    </div>
  </div>
</template>