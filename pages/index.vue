<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <div>
    <h1>You are at {{ route.name }}</h1>
    <Button @click="$router.push('/app')">Go to App</Button>
  </div>
</template>