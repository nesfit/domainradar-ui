<template>
  <slot name="trigger" :state="state">
    <button @click="state.open = true">OPEN</button>
  </slot>
  <Teleport to="#holoteleports" v-if="mounted">
    <Transition name="modal-fade">
      <div v-if="state.open" class="modal">
        <div class="modal-closer" @click="state.open = false">
        </div>
        <div
          class="modal-inner bg-holo-bg border-2 border-primary text-holo-fg p-4">
          <div class="flex justify-end" v-if="showClose">
            <HButton @click="state.open = false" symmetrical color="destructive">
              <MdiIcon icon="mdiClose" />
            </HButton>
          </div>
          <slot :state="state"></slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
const mounted = ref(false)
const state = reactive({
  open: false
})

defineProps<{
  showClose?: boolean
}>()

onMounted(() => {
  mounted.value = true
})
</script>

<style>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-closer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  cursor: pointer;
  z-index: -1;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.1s linear;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>