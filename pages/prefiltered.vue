<template>
  <div class="px-16 py-8 flex flex-col gap-12 max-w-screen-xl">
    <div class="flex items-center gap-2 text-2xl font-black text-cyan-900 dark:text-cyan-100 -ml-8">
      <button @click="go(-1)">
        <MdiIcon icon="mdiArrowLeft" />
      </button>
      <h1>{{ $t('prefiltered.title') }}</h1>
    </div>
    <ul>
      <li v-for="domain in data?.data">
        <strong>{{ domain._id.domainName }}</strong> ({{ $d(domain._id.timestamp, 'long') }})
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
definePageMeta(
  {
    middleware: "auth",
    auth: { guestRedirectTo: "/" }
  }
)

const { go } = useRouter()
const { data, error, refresh } = await useFetch("/api/domains/prefiltered")
</script>