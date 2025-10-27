// src/stores/useAuthStore.js
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    mode: 'guest' // 'guest' 或 'admin'
  }),
  actions: {
    setMode(newMode) {
      this.mode = newMode
      localStorage.setItem('authMode', newMode)
    },
    loadMode() {
      const saved = localStorage.getItem('authMode')
      if (saved) this.mode = saved
    }
  }
})
