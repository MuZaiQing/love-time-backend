<template>
  <div ref="containerRef" class="fixed inset-0 pointer-events-none z-0 overflow-hidden"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useThemeStore } from '@/stores/theme'

const containerRef = ref(null)
const themeStore = useThemeStore()
let p5Instance = null

const sketch = (p) => {
  let particles = []
  const isMobile = window.innerWidth < 768
  const particleCount = isMobile ? 80 : 120
  const flowScale = 0.0015
  const noiseSpeed = 0.0004
  let time = 0
  let isDark = false

  class Particle {
    constructor() {
      this.reset()
    }

    reset() {
      this.x = p.random(p.width)
      this.y = p.random(p.height)
      this.prevX = this.x
      this.prevY = this.y
      this.life = p.random(300, 600)
      this.maxLife = this.life
      this.speed = p.random(0.5, 1.2)
      this.alpha = p.random(0.15, 0.25)
      this.trail = []
      this.maxTrailLength = isMobile ? 25 : 35
      this.colorSeed = p.random()
    }

    update() {
      this.trail.push({ x: this.x, y: this.y })
      if (this.trail.length > this.maxTrailLength) {
        this.trail.shift()
      }

      this.prevX = this.x
      this.prevY = this.y

      const noiseVal = p.noise(this.x * flowScale, this.y * flowScale, time * 0.3)
      const angle = noiseVal * p.TWO_PI * 2

      this.x += Math.cos(angle) * this.speed
      this.y += Math.sin(angle) * this.speed
      this.life--

      if (this.life <= 0 || this.x < -100 || this.x > p.width + 100 || this.y < -100 || this.y > p.height + 100) {
        this.reset()
      }
    }

    draw() {
      const lifeRatio = this.life / this.maxLife
      const fadeIn = Math.min(1, (this.maxLife - this.life) / 80)
      const fadeOut = lifeRatio
      const effectiveAlpha = this.alpha * fadeIn * fadeOut

      if (this.trail.length < 2) return

      for (let i = 1; i < this.trail.length; i++) {
        const trailProgress = i / this.trail.length
        const trailAlpha = effectiveAlpha * trailProgress

        const prev = this.trail[i - 1]
        const curr = this.trail[i]

        let r, g, b, a

        if (isDark) {
          const baseR = 147
          const baseG = 197
          const baseB = 253
          const accentR = 196
          const accentG = 181
          const accentB = 253

          const mix = (this.colorSeed + trailProgress * 0.3) % 1
          r = baseR + (accentR - baseR) * mix
          g = baseG + (accentG - baseG) * mix
          b = baseB + (accentB - baseB) * mix
          a = 55 * trailAlpha * 2
        } else {
          const baseR = 251
          const baseG = 207
          const baseB = 232
          const accentR = 221
          const accentG = 214
          const accentB = 254

          const mix = (this.colorSeed + trailProgress * 0.3) % 1
          r = baseR + (accentR - baseR) * mix
          g = baseG + (accentG - baseG) * mix
          b = baseB + (accentB - baseB) * mix
          a = 45 * trailAlpha * 2
        }

        p.stroke(r, g, b, a)
        p.strokeWeight(3 * trailProgress)
        p.line(prev.x, prev.y, curr.x, curr.y)
      }
    }
  }

  p.setup = function() {
    const canvas = p.createCanvas(p.windowWidth, p.windowHeight)
    canvas.parent(containerRef.value)
    p.colorMode(p.RGB, 255, 255, 255, 255)
    p.noStroke()
    p.frameRate(60)

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }
  }

  p.draw = function() {
    const bgAlpha = isDark ? 8 : 6
    p.background(isDark ? 15 : 250, isDark ? 14 : 254, isDark ? 26 : 254, bgAlpha)

    for (const particle of particles) {
      particle.update()
      particle.draw()
    }

    time += noiseSpeed
  }

  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }

  p.setDarkMode = function(dark) {
    isDark = dark
  }

  p.destroy = function() {
    p.remove()
  }
}

function handleThemeChange() {
  if (p5Instance && typeof p5Instance.setDarkMode === 'function') {
    p5Instance.setDarkMode(themeStore.isDarkMode)
  }
}

onMounted(() => {
  p5Instance = new p5(sketch)
  p5Instance.setDarkMode(themeStore.isDarkMode)
  watch(() => themeStore.isDarkMode, handleThemeChange)
})

onUnmounted(() => {
  if (p5Instance) {
    p5Instance.destroy()
    p5Instance = null
  }
})
</script>
