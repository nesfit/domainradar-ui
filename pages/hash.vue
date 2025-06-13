<template>
  <div class="min-h-screen bg-holo-bg p-8">
    <div class="max-w-2xl mx-auto">
      <div class="bg-holo-bg border border-holo-fg/20 rounded-lg p-6">
        <h1 class="text-2xl font-bold text-holo-fg mb-6">Password Hash Utility</h1>

        <div class="space-y-4">
          <div>
            <HInputField v-model="password" :label="'Password to hash'" type="password"
              placeholder="Enter password to hash" :disabled="loading" />
          </div>

          <div>
            <HButton @click="hashCurrentPassword" color="accent" :disabled="!password || loading">
              <span v-if="loading" class="flex items-center">
                <MdiIcon icon="mdiLoading" class="animate-spin mr-2" />
                Hashing...
              </span>
              <span v-else>Generate Hash</span>
            </HButton>
          </div>

          <div v-if="hashedPassword" class="mt-6">
            <label class="block text-sm font-medium text-holo-fg mb-2">
              Hashed Password:
            </label>
            <div class="bg-holo-bg/50 border border-holo-fg/30 rounded p-3">
              <code class="text-sm text-holo-fg break-all font-mono">{{ hashedPassword }}</code>
            </div>
            <HButton @click="copyToClipboard" class="mt-2" color="foreground" size="sm">
              <MdiIcon icon="mdiContentCopy" class="mr-1" />
              Copy to Clipboard
            </HButton>
          </div>

          <div v-if="error" class="text-red-500 text-sm">
            {{ error }}
          </div>

          <div v-if="copied" class="text-green-500 text-sm">
            Copied to clipboard!
          </div>
        </div>

        <div class="mt-8 p-4 bg-holo-fg/5 rounded-lg">
          <h3 class="font-semibold text-holo-fg mb-2">Usage Instructions:</h3>
          <ol class="text-sm text-holo-fg/80 space-y-1 list-decimal list-inside">
            <li>Enter the password you want to hash</li>
            <li>Click "Generate Hash" to create a secure hash</li>
            <li>Copy the generated hash</li>
            <li>Use it in your NUXT_AUTH_USERS environment variable</li>
            <li>Format: "username:hashedPassword;username2:hashedPassword2"</li>
          </ol>
        </div>

        <div class="mt-4">
          <HButton @click="$router.back()" color="foreground">
            <MdiIcon icon="mdiArrowLeft" class="mr-1" />
            Go Back
          </HButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const password = ref('')
const hashedPassword = ref('')
const loading = ref(false)
const error = ref('')
const copied = ref(false)

async function hashCurrentPassword() {
  if (!password.value) return

  loading.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/auth/hash-password', {
      method: 'POST',
      body: { password: password.value }
    })

    hashedPassword.value = response.hash
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to hash password'
  } finally {
    loading.value = false
  }
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(hashedPassword.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
  }
}

// Clear copied status when hash changes
watch(hashedPassword, () => {
  copied.value = false
})
</script>
