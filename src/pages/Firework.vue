<template>
  <div class="firework" :style="{ top: posY + 'px', left: posX + 'px' }">
    <div
      class="dot"
      v-for="(particle, index) in particles"
      :key="index"
      :style="{
        backgroundColor: particle.color,
        top: particle.y + 'px',
        left: particle.x + 'px',
        opacity: particle.alpha
      }"
    ></div>
  </div>
</template>

<script>
  export default {
    name: 'FireworkEffect',
    data() {
      return {
        particles: [],
        posX: 0,
        posY: 0,
        animationFrame: null
      }
    },
    methods: {
      explode() {
        this.particles = []
        for (let i = 0; i < 50; i++) {
          const particle = {
            x: 150,
            y: 150,
            color: getRandomColor(),
            speedX: getRandomFloat(-5, 5),
            speedY: getRandomFloat(-5, 5),
            gravity: 0.1,
            alpha: 1
          }
          this.particles.push(particle)
        }
        this.animate()
      },
      animate() {
        this.animationFrame = requestAnimationFrame(this.animate)
        this.particles.forEach((p, i) => {
          p.x += p.speedX
          p.y += p.speedY
          p.speedY += p.gravity
          p.alpha -= 0.01
          if (p.alpha <= 0) this.particles.splice(i, 1)
        })
        if (this.particles.length === 0) cancelAnimationFrame(this.animationFrame)
      }
    },
    mounted() {
      this.posX = window.innerWidth / 2 - 150
      this.posY = window.innerHeight / 2 - 150
    }
  }

  function getRandomColor() {
    const letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }
    return color
  }

  function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min
  }
</script>

<style scoped>
  .firework {
    position: fixed;
    width: 300px;
    height: 300px;
    pointer-events: none;
    z-index: 999;
  }
  .dot {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
</style>
