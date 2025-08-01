<template>
  <div class="navigation-bar q-pa-sm row justify-center items-center q-gutter-md">
    <q-btn
      dense
      round
      flat
      icon="mdi-chevron-left"
      aria-label="上個月"
      @click="$emit('prev')"
      class="nav-btn"
      color="primary"
      v-ripple
    />
    <q-btn
      dense
      round
      flat
      icon="mdi-calendar-today"
      aria-label="今天"
      @click="$emit('today')"
      class="nav-btn today-btn"
      color="secondary"
      v-ripple
    />
    <q-btn
      dense
      round
      flat
      icon="mdi-chevron-right"
      aria-label="下個月"
      @click="$emit('next')"
      class="nav-btn"
      color="primary"
      v-ripple
    />
  </div>
</template>

<script setup>
  // 不需要特別引入什麼，quasar會自動識別mdi icon
</script>

<style scoped>
  .navigation-bar {
    background-color: var(--q-color-grey-2);
    border-radius: 8px;
    padding: 8px 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    user-select: none;
    width: fit-content;
    margin: 0 auto;
  }

  .nav-btn {
    min-width: 40px;
    min-height: 40px;
    font-size: 20px;
    transition: background-color 0.3s ease;
  }

  .nav-btn:hover {
    background-color: var(--q-color-primary-light);
  }

  .today-btn {
    font-weight: bold;
    font-size: 22px;
    background-color: var(--q-color-secondary);
    color: white;
  }

  .today-btn:hover {
    background-color: var(--q-color-secondary-dark);
  }
</style>
