<script lang="ts" setup>
import { ref, inject, computed } from 'vue'
import { watchDebounced } from '@vueuse/core'
import View from 'ol/View'
import { fromLonLat } from 'ol/proj'

const props = defineProps<{
  dots: [number, number][]
}>()

const view = ref<View | null>(null)

const defaultPosition = [0, 0]
const center = ref(defaultPosition)
const projection = ref('EPSG:3857')
const defaultZoom = 4
const maxZoom = 7
const zoom = ref(defaultZoom)

const transformedDots = computed(() => props.dots.map(dot => fromLonLat(dot)))

const uniqueDots = computed(() => {
  const unique = new Set<string>()
  const result: [number, number][] = []
  for (const dot of transformedDots.value) {
    const key = `${dot[0]},${dot[1]}`
    if (!unique.has(key)) {
      unique.add(key)
      result.push(dot as [number, number])
    }
  }
  return result
})

//

function calculateEnclosingRectangle(coordinates: [number, number][]): [number, number, number, number] {
  let minLat = Infinity
  let minLon = Infinity
  let maxLat = -Infinity
  let maxLon = -Infinity

  coordinates.forEach(([lat, lon]) => {
    minLat = Math.min(minLat, lat)
    minLon = Math.min(minLon, lon)
    maxLat = Math.max(maxLat, lat)
    maxLon = Math.max(maxLon, lon)
  })

  return [minLat, minLon, maxLat, maxLon]
}

function easeOutExpotential(t: number) {
  return t === 1 ? 1 : -Math.pow(2, -10 * t) + 1
}

function easeInOutExponential(t: number) {
  return t === 0 || t === 1
    ? t
    : t < 0.5
      ? +0.5 * Math.pow(2, (20 * t) - 10)
      : -0.5 * Math.pow(2, 10 - (t * 20)) + 1
}

function animateViewToDots() {
  const dots = uniqueDots.value
  // reset to default view if no dots are present
  if (dots.length === 0) {
    view.value?.animate({
      zoom: defaultZoom,
      duration: 1000,
      easing: easeInOutExponential
    })
    return
  }
  // otherwise animate to fit the dots
  const extent = calculateEnclosingRectangle(dots)
  view.value?.fit(extent, {
    duration: 500,
    easing: easeOutExpotential,
    padding: [50, 50, 50, 450],
    maxZoom
  })
}

watchDebounced(uniqueDots, animateViewToDots, { debounce: 100 })
</script>

<template>
  <ClientOnly>
    <ol-map :loadTilesWhileAnimating="true" :loadTilesWhileInteracting="true" :controls="[]"
      class="w-full h-full [background-color:_hsl(var(--background))] map-theme">
      <ol-view ref="view" :center="center" :zoom="zoom" :projection="projection" />
      <ol-tile-layer :preload="Infinity">
        <ol-source-osm />
      </ol-tile-layer>
      <ol-attribution-control />
      <ol-overlay v-for="dot in uniqueDots" :key="`${dot[0]},${dot[1]}`" :position="dot" :positioning="'center-center'">
        <div class="w-6 h-6 rounded-full bg-accent border-4 border-white loc-shadow pop-in">
        </div>
      </ol-overlay>
    </ol-map>
  </ClientOnly>
</template>

<style scoped>
.loc-shadow {
  @apply text-accent;
  box-shadow: 0 0 1rem 0.5rem currentColor;
  animation: pulsing 2s infinite;
}

@keyframes pulsing {
  50% {
    box-shadow: 0 0 4rem 1rem currentColor;
  }
}

.map-theme {
  filter: invert(var(--map-invert, 0)) hue-rotate(var(--map-hue-rotate, 0deg));
}

.holo-root[data-holo-theme="radar-dark"] .map-theme {
  --map-invert: 1;
  --map-hue-rotate: 210deg;
}
</style>