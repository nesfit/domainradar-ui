<script setup lang="ts">
// Redirect authenticated users to app
const { loggedIn, fetch: fetchSession } = useUserSession()
const router = useRouter()
if (loggedIn.value) {
  await router.push('/app')
}

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function login() {
  if (!username.value || !password.value) {
    error.value = 'Please enter both username and password'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        username: username.value,
        password: password.value
      }
    })

    // Refresh user session to get updated state
    await fetchSession()

    // Navigate to app
    await router.push('/app')
  } catch (err: any) {
    error.value = err.data?.message || 'Invalid credentials'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-holo-bg">
    <div class="max-w-md w-full space-y-8 p-8">
      <div class="text-center">
        <img src="/icon.svg" alt="Domain Radar" class="mx-auto h-12 w-auto">
        <h2 class="mt-6 text-3xl font-extrabold text-holo-fg">
          {{ $t('sign_in') }}
        </h2>
      </div>

      <form @submit.prevent="login" class="mt-8 space-y-6">
        <div class="space-y-4">
          <HInputField v-model="username" :label="$t('username')" type="text" required autofocus :disabled="loading" />

          <HInputField v-model="password" :label="$t('password')" type="password" required :disabled="loading" />
        </div>

        <div v-if="error" class="text-red-500 text-sm text-center">
          {{ error }}
        </div>

        <div>
          <HButton type="submit" color="accent" :disabled="loading || !username || !password">
            <span v-if="loading" class="flex items-center justify-center">
              <MdiIcon icon="mdiLoading" class="animate-spin mr-2" />
              {{ $t('signing_in') }}
            </span>
            <span v-else>{{ $t('sign_in') }}</span>
          </HButton>
        </div>
      </form>
    </div>
  </div>
</template>
