<script setup lang="ts">
const route = useRoute()
const { locale, setLocale } = useI18n()
</script>

<template>
  <div>
    <h1>You are at {{ route.name }}</h1>
    <img src="https://loremflickr.com/320/240" alt="">
    <div class="fixed right-0 z-50">
      <Button @click="setLocale('en')">EN</Button>
      <Button @click="setLocale('cs')">CZ</Button>
    </div>
  </div>
</template>