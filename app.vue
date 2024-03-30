<template>
  <NuxtPage />
</template>

<style>
body {
  background-color: #abd3df;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #213552;
  }
}

.page-leave-active,
.page-out-leave-active {
  transition: transform 0.4s cubic-bezier(0.32, 0, 0.67, 0), opacity 0.3s;
}

.page-enter-active {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s;
}

.page-enter-from,
.page-leave-to,
.page-out-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
