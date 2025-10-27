<template>
  <q-layout view="lHh Lpr lFf" class="blog-layout my-custom-font">
    <!-- 左側 Drawer -->
    <q-drawer v-model="leftDrawerOpen" behavior="mobile" bordered>
      <q-list>
        <!-- Blog 區塊 -->
        <q-item-label header class="menu-header">📝 Blog</q-item-label>
        <q-separator spaced />
        <q-item
          v-for="link in linksList.slice(0, 2)"
          :key="link.title"
          clickable
          v-ripple
          :to="link.link"
          class="menu-item"
        >
          <q-item-section avatar>
            <q-icon :name="link.icon" class="menu-icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="menu-title">{{ link.title }}</q-item-label>
            <q-item-label caption class="menu-caption">{{ link.caption }}</q-item-label>
          </q-item-section>
        </q-item>

        <!-- Notes 區塊 -->
        <q-item-label header class="menu-header q-mt-md">📚 Notes</q-item-label>
        <q-separator spaced />
        <q-item
          v-for="link in linksList.slice(2, 4)"
          :key="link.title"
          clickable
          v-ripple
          :to="link.link"
          class="menu-item"
        >
          <q-item-section avatar>
            <q-icon :name="link.icon" class="menu-icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="menu-title">{{ link.title }}</q-item-label>
            <q-item-label caption class="menu-caption">{{ link.caption }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/calendar" class="menu-item">
          <q-item-section avatar>
            <q-icon name="calendar_month" class="menu-icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="menu-title">行事曆</q-item-label>
            <q-item-label caption class="menu-caption">待辦事項</q-item-label>
          </q-item-section>
        </q-item>

        <!-- 工具區塊：新增程式碼格式化 -->
        <q-item-label header class="menu-header q-mt-md">🛠 工具</q-item-label>
        <q-separator spaced />
        <q-item clickable v-ripple to="/formatter" class="menu-item">
          <q-item-section avatar>
            <q-icon name="code" class="menu-icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="menu-title">程式格式化</q-item-label>
            <q-item-label caption class="menu-caption">自動美化程式格式</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/filetrans" class="menu-item">
          <q-item-section avatar>
            <q-icon name="download" class="menu-icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="menu-title">轉檔功能</q-item-label>
            <q-item-label caption class="menu-caption">常用的轉檔</q-item-label>
          </q-item-section>
        </q-item>

        <q-item-label header class="menu-header q-mt-md"
          ><q-icon name="link" class="q-mr-sm" /> 工作相關</q-item-label
        >
        <q-separator spaced />
        <q-item clickable v-ripple to="/work" class="menu-item">
          <q-item-section avatar>
            <q-icon name="work" class="menu-icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="menu-title">工作連結</q-item-label>
            <q-item-label caption class="menu-caption">常用工作超連結管理</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/tasks" class="menu-item">
          <q-item-section avatar>
            <q-icon name="work" class="menu-icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="menu-title">工作代辦事項</q-item-label>
            <q-item-label caption class="menu-caption">待辦事項</q-item-label>
          </q-item-section>
        </q-item>

        <!-- 
              <q-item-label header class="menu-header q-mt-md">👤 個人履歷</q-item-label>
              <q-separator spaced />
              <q-item clickable v-ripple to="/resume" class="menu-item">
                  <q-item-section avatar>
                      <q-icon name="person" class="menu-icon" />
                  </q-item-section>
                  <q-item-section>
                      <q-item-label class="menu-title">個人經歷</q-item-label>
                      <q-item-label caption class="menu-caption">心路歷程</q-item-label>
                  </q-item-section>
              </q-item> -->
      </q-list>
    </q-drawer>
    <!-- Header -->
    <q-header elevated :class="isDark ? 'bg-grey-10 text-white' : 'bg-white text-primary'">
      <q-toolbar class="q-px-md">
        <q-btn flat dense round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />
        <q-btn flat dense round icon="home" aria-label="home" @click="$router.push('/resume')" />
        <!-- <q-toolbar-title class="row items-center q-gutter-sm clickable blog-title" @click="$router.push('/')"> -->
        <!-- <q-toolbar-title class="row items-center q-gutter-sm " >
                  <q-icon name="home" size="md" />
                  <span>Blog</span>
              </q-toolbar-title> -->

        <q-space />
        <!-- 新增：登入按鈕 -->
        <q-btn
          flat
          dense
          round
          :icon="authStore.mode === 'admin' ? 'lock_open' : 'lock'"
          :color="authStore.mode === 'admin' ? 'positive' : 'grey'"
          @click="showPasswordDialog = true"
          aria-label="Login Mode"
        />

        <q-toggle
          v-model="isDark"
          checked-icon="dark_mode"
          unchecked-icon="light_mode"
          color="amber"
          keep-color
          dense
          aria-label="Toggle Dark Mode"
        />
      </q-toolbar>

      <!-- 跑馬燈 -->
      <div class="marquee-container" :class="isDark ? 'marquee-dark' : 'marquee-light'">
        <transition name="marquee-fade" mode="out-in">
          <div class="marquee-item" :key="currentIndex">
            <q-icon
              name="campaign"
              size="sm"
              class="q-mr-sm"
              :color="isDark ? 'amber' : 'primary'"
            />
            {{ messages[currentIndex] }}
          </div>
        </transition>
        <q-btn
          v-if="authStore.mode === 'admin'"
          dense
          flat
          icon="build"
          class="edit-icon q-ml-sm"
          style="position: absolute; right: 8px"
          @click="showEditDialog = true"
          :color="isDark ? 'amber' : 'primary'"
          aria-label="Edit Messages"
        />
      </div>
    </q-header>

    <!-- Page Content -->
    <q-page-container
      class="q-pa-md"
      :class="$q.dark.isActive ? 'resume-dark text-white' : 'resume-light text-black'"
      :style="isResumePage ? 'max-width: 1700px; ' : 'max-width: 1500px;'"
    >
      <div class="q-gutter-y-md">
        <router-view />
      </div>
    </q-page-container>

    <div class="q-container text-center">
      <div class="text-caption">© 2025 Chen's Blog. All rights reserved.</div>
    </div>

    <!-- 編輯訊息 Dialog -->
    <q-dialog v-model="showEditDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">編輯跑馬燈訊息</div>
        </q-card-section>

        <q-card-section>
          <div v-for="(msg, index) in editedMessages" :key="index" class="q-mb-sm">
            <q-input
              filled
              v-model="editedMessages[index]"
              :label="'訊息 ' + (index + 1)"
              dense
              autofocus
            />
          </div>
          <q-btn
            icon="add"
            label="新增訊息"
            flat
            dense
            @click="editedMessages.push('')"
            class="q-mt-sm"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="grey" v-close-popup />
          <q-btn flat label="儲存" color="primary" @click="saveMessages" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 密碼輸入 Dialog -->
    <q-dialog v-model="showPasswordDialog" persistent>
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">輸入管理密碼</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="passwordInput"
            type="password"
            label="請輸入密碼"
            filled
            dense
            autofocus
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="grey" v-close-popup />
          <q-btn flat label="確認" color="primary" @click="verifyPassword" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
  import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
  import { useQuasar } from 'quasar'
  import { useRoute } from 'vue-router'
  import { useAuthStore } from 'src/stores/useAuthStore' // ✅ 新增這行

  const $q = useQuasar()
  const route = useRoute()
  const authStore = useAuthStore() // ✅ 使用 Pinia store

  const showPasswordDialog = ref(false)
  const passwordInput = ref('')

  const leftDrawerOpen = ref(false)
  const isDark = ref(true)

  const defaultMessages = [
    "歡迎來到 Chen's Blog！",
    '程式和人只要一個會跑就好!',
    '努力不一定會成功，但不努力會很輕鬆!',
    '先苦不一定會後甘但先甘一定甘',
    '在哪裡跌倒，就在哪裡躺好。'
  ]

  const messages = ref([...defaultMessages])
  const currentIndex = ref(0)
  let intervalId = null

  const showEditDialog = ref(false)
  const editedMessages = ref([...messages.value])

  watch(isDark, val => $q.dark.set(val))

  watch(showEditDialog, val => {
    if (val) editedMessages.value = [...messages.value]
  })

  const applyOverflowStyle = () => {
    if (isResumePage()) {
      document.body.style.overflowX = 'hidden'
      document.body.style.overflowY = 'auto'
    } else {
      document.body.style.overflowX = ''
      document.body.style.overflowY = ''
    }
  }

  onMounted(() => {
    $q.dark.set(isDark.value)
    const stored = localStorage.getItem('marqueeMessages')
    if (stored) {
      try {
        messages.value = JSON.parse(stored)
      } catch (e) {
        messages.value = [...defaultMessages]
        console.log(e)
      }
    }
    intervalId = setInterval(() => {
      currentIndex.value = (currentIndex.value + 1) % messages.value.length
    }, 4000)

    applyOverflowStyle()
    authStore.loadMode()
  })

  // 驗證密碼
  const verifyPassword = () => {
    if (passwordInput.value === '072830') {
      authStore.setMode('admin')
      $q.notify({ type: 'positive', message: '登入成功，進入管理模式！' })
    } else {
      authStore.setMode('guest')
      $q.notify({ type: 'warning', message: '密碼錯誤，切換為訪客模式。' })
    }
    showPasswordDialog.value = false
    passwordInput.value = ''
  }

  onBeforeUnmount(() => {
    if (intervalId) clearInterval(intervalId)
  })

  // 當路由改變時重新套用樣式
  watch(route, () => {
    applyOverflowStyle()
  })

  const saveMessages = () => {
    const filtered = editedMessages.value.filter(msg => msg.trim() !== '')
    messages.value = filtered
    localStorage.setItem('marqueeMessages', JSON.stringify(filtered))
    showEditDialog.value = false
  }

  // 當前是否為履歷頁面
  const isResumePage = () => route.path === '/resume'

  // linksList 你原本資料，留著不動
  const linksList = [
    { title: 'Home', caption: 'Welcome', icon: 'home', link: '/resume' },
    { title: '網頁總覽', caption: 'Blog', icon: 'auto_stories', link: '/' },
    { title: '下班時間', caption: '', icon: 'timer', link: '/blog' },
    { title: 'Notes', caption: 'Code Snippets', icon: 'note', link: '/notes' },
    { title: '行事曆', caption: 'Calendar', icon: 'mdi-calendar', link: '/calendar' },
    { title: '程式碼工具', caption: 'Calendar', icon: 'mdi-calendar', link: '/formatter' },
    { title: '工作連結', icon: 'work', caption: '常用工作資源', link: '/work' }
  ]
</script>

<style>
  .blog-layout {
    font-family: 'Fira Code', 'JetBrains Mono', monospace;
  }

  .q-toolbar-title {
    font-weight: bold;
    letter-spacing: 0.5px;
  }

  .q-list {
    font-size: 15px;
  }

  .q-item__label {
    font-weight: 500;
  }

  .q-page-container {
    max-width: 960px;
    margin: 0 auto;
  }

  body.body--dark {
    background-color: #121212;
    color: #ffffff;
  }

  .marquee-container {
    width: 100%;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    font-weight: 500;
    font-size: 16px;
    border-top: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    padding: 0 12px;
    position: relative;
  }

  .marquee-light {
    background-color: #f0f0f0;
    color: #333;
    border-color: #ddd;
  }

  .marquee-dark {
    background-color: #212121;
    color: #eee;
    border-color: #444;
  }

  .marquee-item {
    white-space: nowrap;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    text-align: center;
  }

  .edit-icon {
    margin-left: auto;
  }

  .marquee-fade-enter-from {
    opacity: 0;
    transform: translateY(100%);
  }

  .marquee-fade-enter-active {
    transition: all 0.5s ease;
  }

  .marquee-fade-enter-to {
    opacity: 1;
    transform: translateY(0);
  }

  .marquee-fade-leave-from {
    opacity: 1;
    transform: translateY(0);
  }

  .marquee-fade-leave-active {
    transition: all 0.5s ease;
  }

  .marquee-fade-leave-to {
    opacity: 0;
    transform: translateY(-100%);
  }

  .footer {
    transition: opacity 0.3s ease;
    font-family: 'Roboto', sans-serif;
    border-top: 1px solid;
  }

  .footer-light {
    background-color: #f9f9f9;
    color: #333;
    border-top-color: #ddd;
  }

  .footer-dark {
    background-color: #121212;
    color: #ccc;
    border-top-color: #444;
  }

  .elegant-menu {
    min-width: 240px;
    border-radius: 12px;
    backdrop-filter: blur(12px);
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(245, 245, 245, 0.85));
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    color: #333;
    overflow: hidden;
  }

  body.body--dark .elegant-menu {
    background: linear-gradient(145deg, rgba(30, 30, 30, 0.95), rgba(50, 50, 50, 0.85));
    color: #fff;
  }

  .menu-header {
    font-weight: 700;
    font-size: 14px;
    color: #999;
    padding: 4px 16px;
  }

  .menu-item {
    transition:
      background 0.3s,
      transform 0.2s;
    border-radius: 8px;
    margin: 2px 8px;
  }

  .menu-item:hover {
    background: rgba(0, 0, 0, 0.05);
    transform: scale(1.02);
  }

  body.body--dark .menu-item:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .menu-icon {
    color: #5e35b1;
    transition: transform 0.3s;
  }

  .menu-item:hover .menu-icon {
    transform: rotate(10deg) scale(1.2);
    color: #ab47bc;
  }

  body.body--dark .menu-icon {
    color: #ffd54f;
  }

  body.body--dark .menu-item:hover .menu-icon {
    color: #ffca28;
  }

  .menu-title {
    font-weight: 600;
  }

  .menu-caption {
    font-size: 12px;
    color: #777;
  }

  body.body--dark .menu-caption {
    color: #bbb;
  }

  .blog-title {
    cursor: pointer;
    transition:
      color 0.2s,
      transform 0.2s;
  }

  .blog-title:hover {
    color: #027be3;
    /* Quasar 主色，可依主題調整 */
    transform: scale(1.03);
  }

  body.body--dark .blog-title:hover {
    color: #ffca28;
    /* 深色模式的 hover 顏色 */
  }

  .clickable:hover {
    cursor: pointer;
    color: #027be3;
  }

  .my-custom-font {
    font-family: 'Cubic11', sans-serif;
  }

  .resume-dark {
    background: linear-gradient(160deg, #333333, #333333);
    background-attachment: fixed;
    background-size: cover;
    position: relative;
  }
  .resume-dark::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url('https://www.transparenttextures.com/patterns/asfalt-dark.png');
    opacity: 0.06;
    z-index: 0;
    pointer-events: none;
  }

  .resume-light {
    background: linear-gradient(180deg, #f4f7fb, #e5ecf3);
    background-attachment: fixed;
    background-size: cover;
    position: relative;
  }
  .resume-light::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url('https://www.transparenttextures.com/patterns/graphy.png');
    opacity: 0.05;
    z-index: 0;
    pointer-events: none;
  }
</style>
