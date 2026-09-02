<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

type Star = {
  x: number
  y: number
  radius: number
  alpha: number
  /** またたきの速さと位相 */
  speed: number
  phase: number
}

/** 星の密度（1 個あたりの面積 px²） */
const AREA_PER_STAR = 7000
const MAX_STARS = 420

const canvas = ref<HTMLCanvasElement | null>(null)
const isVisible = ref(false)

let stars: Star[] = []
let animationId = 0
let context: CanvasRenderingContext2D | null = null

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

const createStars = (width: number, height: number) => {
  const count = Math.min(
    MAX_STARS,
    Math.round((width * height) / AREA_PER_STAR)
  )

  stars = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius:
      Math.random() < 0.9 ? Math.random() * 0.9 + 0.3 : Math.random() * 1.4 + 1,
    alpha: Math.random() * 0.5 + 0.25,
    speed: Math.random() * 0.6 + 0.2,
    phase: Math.random() * Math.PI * 2,
  }))
}

const resize = () => {
  const element = canvas.value
  if (!element) {
    return
  }

  const ratio = Math.min(window.devicePixelRatio || 1, 2)
  const width = window.innerWidth
  const height = window.innerHeight

  element.width = width * ratio
  element.height = height * ratio
  element.style.width = `${width}px`
  element.style.height = `${height}px`

  context = element.getContext('2d')
  context?.setTransform(ratio, 0, 0, ratio, 0, 0)

  createStars(width, height)
}

const draw = (time: number) => {
  if (!context || !canvas.value) {
    return
  }

  const width = window.innerWidth
  const height = window.innerHeight
  context.clearRect(0, 0, width, height)

  for (const star of stars) {
    const twinkle = motionQuery.matches
      ? 1
      : 0.65 + Math.sin((time / 1000) * star.speed + star.phase) * 0.35

    context.globalAlpha = Math.min(1, star.alpha * twinkle)
    context.fillStyle = '#e0e0e4'
    context.beginPath()
    context.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
    context.fill()
  }

  context.globalAlpha = 1
  if (!motionQuery.matches) {
    animationId = window.requestAnimationFrame(draw)
  }
}

const start = () => {
  window.cancelAnimationFrame(animationId)
  resize()
  animationId = window.requestAnimationFrame(draw)
}

const applyColorScheme = () => {
  isVisible.value = darkQuery.matches
  if (isVisible.value) {
    window.requestAnimationFrame(start)
  } else {
    window.cancelAnimationFrame(animationId)
  }
}

const handleResize = () => {
  if (isVisible.value) {
    start()
  }
}

onMounted(() => {
  applyColorScheme()
  darkQuery.addEventListener('change', applyColorScheme)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.cancelAnimationFrame(animationId)
  darkQuery.removeEventListener('change', applyColorScheme)
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <canvas
    v-show="isVisible"
    ref="canvas"
    :class="$style.stars"
    aria-hidden="true"
  />
</template>

<style lang="scss" module>
.stars {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
</style>
