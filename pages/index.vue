<script setup lang="ts">
const route = useRoute()
const { signIn, signOut, session, status, cookies, getProviders } = useAuth()
</script>

<template>
  <div>
    <h1>You are at {{ route.name }}</h1>
    <p>Auth status: {{ status }}</p>
    <p>
      <template v-if="session">
        <p>Session: {{ session }}</p>
        <Button @click="signOut()">Sign Out</Button>
      </template>
      <template v-else>
        <p>No session</p>
        <Button @click="signIn()">Sign In</Button>
      </template>
    </p>
    <hr class="my-4">
    <DomainRadarLogo class="w-16 my-2" />
    <Button @click="status === 'authenticated' ? $router.push('/app') : signIn()">Go to App</Button>
  </div>
</template>