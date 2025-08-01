<template>
  <q-page class="flex flex-center q-pa-xl firework-background">
    <q-card class="glow-card scale-up" flat bordered>
      <q-card-section>
        <div class="text-h4 text-center text-bold">
          ⏳ 下班倒數計時
          <q-btn
            @click="testFireWork"
            class="test-btn q-ml-sm"
            round
            glossy
            color="currentColor"
            icon="celebration"
          >
            <q-tooltip>測試煙火</q-tooltip>
          </q-btn>
        </div>

        <div class="q-mt-lg">
          <q-input
            filled
            v-model="endTime"
            label="設定下班時間"
            type="time"
            dense
            class="glow-input text-h6"
            :rules="[val => !!val || '請選擇時間']"
            @update:model-value="saveToStorage"
          />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="text-center q-py-xl">
        <transition name="flash">
          <div v-if="countdown" key="countdown" class="countdown-text glow-text">
            {{ countdown }}
          </div>
        </transition>
      </q-card-section>
    </q-card>

    <FireworkEffect ref="fireworkEffect" />
  </q-page>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import { useQuasar } from 'quasar'
  import confetti from 'canvas-confetti'
  import FireworkEffect from './Firework.vue'

  const $q = useQuasar()
  const endTime = ref(localStorage.getItem('work-end-time') || '')
  const countdown = ref('')
  let timer = null
  let notified5 = false
  let notified1 = false
  let firedFirework = false
  const fireworkEffect = ref(null)

  const saveToStorage = () => {
    localStorage.setItem('work-end-time', endTime.value)
  }

  const showNotify = (msg, color = 'orange') => {
    $q.notify({ message: msg, color, icon: 'alarm', position: 'top', timeout: 3000 })
  }

  const launchFireworks = () => {
    for (let i = 0; i < 10; i++) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: Math.random() * 0.4 + 0.3 }
      })
    }
    fireworkEffect.value?.explode()
  }

  const testFireWork = () => {
    fireworkEffect.value?.explode()
  }

  const updateCountdown = () => {
    if (!endTime.value) {
      countdown.value = ''
      return
    }

    const [h, m] = endTime.value.split(':').map(Number)
    const now = new Date()
    const end = new Date()
    end.setHours(h, m, 0, 0)
    if (end < now) end.setDate(end.getDate() + 1)
    const diff = Math.floor((end - now) / 1000)

    if (diff <= 0) {
      countdown.value = '🎉 下班啦！🎉'
      if (!firedFirework) {
        launchFireworks()
        firedFirework = true
      }
      return
    }

    const hrs = Math.floor(diff / 3600)
    const mins = Math.floor((diff % 3600) / 60)
    const secs = diff % 60
    countdown.value = `剩下 ${hrs} 小時 ${mins} 分 ${secs} 秒`

    if (diff <= 300 && !notified5) {
      showNotify('還有 5 分鐘就下班囉！', 'info')
      notified5 = true
    }

    if (diff <= 60 && !notified1) {
      showNotify('最後 1 分鐘，準備關機 🔔', 'negative')
      notified1 = true
    }

    firedFirework = false
  }

  onMounted(() => {
    timer = setInterval(updateCountdown, 1000)
    updateCountdown()
  })
  onUnmounted(() => {
    clearInterval(timer)
  })
</script>

<style scoped>
  .scale-up {
    max-width: 800px;
    width: 100%;
    border-radius: 24px;
    transform: scale(1.1);
    transition: transform 0.3s ease;
    background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  }
  body.body--dark .scale-up {
    background: linear-gradient(135deg, #2a2a2a, #1f1f1f);
  }

  .glow-card {
    box-shadow: 0 0 30px rgba(0, 255, 255, 0.2);
  }
  body.body--dark .glow-card {
    box-shadow: 0 0 30px rgba(255, 255, 0, 0.3);
  }

  .glow-input .q-field__control {
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(4px);
    border-radius: 12px;
  }
  body.body--dark .glow-input .q-field__control {
    background: rgba(255, 255, 255, 0.05);
  }

  .countdown-text {
    font-size: 36px;
    color: #00acc1;
  }
  body.body--dark .countdown-text {
    color: #ffeb3b;
  }

  .glow-text {
    text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
  }

  .flash-enter-active {
    animation: flash 1.2s ease;
  }
  @keyframes flash {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.2;
    }
  }

  .firework-background {
    background: url('https://raw.githubusercontent.com/VincentGarreau/particles.js/master/demo/media/starbg.jpg')
      center center / cover no-repeat;
    position: relative;
    min-height: 100vh;
    overflow: hidden;
  }

  .firework-background::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background-image: radial-gradient(white 1px, transparent 1px);
    background-size: 3px 3px;
    opacity: 0.15;
    animation: starflow 60s linear infinite;
    z-index: 0;
  }

  @keyframes starflow {
    from {
      transform: translateY(0);
    }
    to {
      transform: translateY(100px);
    }
  }

  .test-btn {
    animation: shine 1.5s infinite;
  }
  @keyframes shine {
    0% {
      box-shadow: 0 0 10px #fff;
    }
    50% {
      box-shadow: 0 0 20px #e91e63;
    }
    100% {
      box-shadow: 0 0 10px #fff;
    }
  }

  /* .firework-background {
  position: relative;
  background: url('https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1920&q=80') no-repeat center center;
  background-size: cover;
  overflow: hidden;
  min-height: 100vh;
} */
</style>
