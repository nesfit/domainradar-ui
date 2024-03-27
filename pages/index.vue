<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <div>
    <h1>You are at {{ route.name }}</h1>
    <Button @click="$router.push('/about')">Go to About</Button>
    <div class="fixed w-full h-full top-0 left-0">
      <Map :dots="[]" />
    </div>
  </div>
</template>