<template>
  <div class="q-mt-xl q-px-md my-custom-font">
    <!-- Welcome Banner -->
    <q-banner
      class="text-center q-pa-sm rounded-borders banner-glow"
      :class="$q.dark.isActive ? 'bg-grey-10 text-grey-2' : 'bg-primary text-white'"
    >
      <div class="text-h5 animate__animated animate__fadeInDown text-outline">
        🚀 Welcome to Blog — 分享開發、筆記與生活日常
      </div>
    </q-banner>

    <!-- 主區塊：雙欄排版 -->
    <div class="row q-col-gutter-xl q-mt-lg">
      <!-- 主內容區（文章） -->
      <div class="col-12 col-md-8">
        <!-- Carousel -->
        <q-carousel
          animated
          v-model="slide"
          arrows
          navigation
          infinite
          height="400px"
          class="rounded-borders q-mb-md"
        >
          <q-carousel-slide v-for="(img, index) in images" :key="index" :name="index + 1">
            <img :src="`${baseUrl}${img}`" :alt="`slide ${index + 1}`" class="carousel-img" />
          </q-carousel-slide>
        </q-carousel>

        <!-- Search Box -->
        <q-input
          filled
          v-model="searchQuery"
          placeholder="Search blog posts..."
          dense
          debounce="300"
          clearable
          class="q-mb-md"
        >
          <template #append>
            <q-icon name="search" />
          </template>
        </q-input>

        <!-- Tags -->
        <!-- <q-card flat bordered class="q-pa-md q-mb-md">
          <div class="text-subtitle1 text-outline">🏷️ Popular Tags</div>
          <q-separator spaced />
          <div class="q-gutter-sm q-mt-sm">
            <q-chip
              v-for="tag in allTagsOptions"
              :key="tag"
              clickable
              icon="label"
              :outline="false"
              class="q-mb-xs"
              :style="getChipStyle(tag)"
              @click="toggleTagFilter(tag)"
            >
              {{ tag }}
            </q-chip>
          </div>
        </q-card> -->

        <!-- Latest Posts & Notes -->
        <!-- 最新文章與筆記 -->
        <q-card flat bordered class="q-pa-md q-mb-md">
          <div class="text-h5 q-mb-sm text-outline text-subtitle1">📝 Latest Notes</div>

          <q-list bordered padding>
            <q-item v-for="(note, index) in notes" :key="index" clickable @click="openNote(note)">
              <q-item-section>{{ note.name }}</q-item-section>
            </q-item>

            <q-item v-if="notes.length === 0">
              <q-item-section class="text-grey">目前沒有筆記</q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <!-- 側邊欄 -->
      <div class="col-12 col-md-4">
        <!-- Weekly Update -->
        <q-card flat bordered class="q-pa-md q-mb-md">
          <div class="text-subtitle1 text-outline">📅 Weekly Update</div>
          <q-separator spaced />
          <div class="row items-center q-col-gutter-md">
            <q-icon name="event_note" size="32px" color="secondary" />
            <div class="col">
              <div class="text-body1">每週固定更新 1~2 篇技術文章與實用筆記</div>
              <div class="text-caption text-grey">持續紀錄與學習，希望對你有幫助 🙌</div>
            </div>
          </div>
        </q-card>

        <!-- 下班倒數卡片 -->
        <q-card flat bordered class="q-pa-md q-mb-md">
          <div class="text-subtitle1 text-outline">⏰ 下班倒數</div>
          <q-separator spaced />
          <div class="row items-center q-gutter-md">
            <q-icon name="alarm" size="32px" color="orange" />
            <div class="text-body1">{{ remainingTime }}</div>
          </div>
        </q-card>

        <q-card flat bordered class="q-pa-md q-mb-md">
          <!-- 急件任務區塊 -->

          <q-card flat bordered class="q-mb-md">
            <q-card-section class="row items-center justify-between">
              <div class="text-h6">
                <q-icon name="warning" color="negative" class="q-mr-sm" /> 急件待辦
              </div>
              <q-btn
                dense
                flat
                icon="open_in_new"
                color="primary"
                @click="$router.push('/tasks')"
              />
            </q-card-section>

            <q-separator />

            <q-card-section v-if="urgentTasks.length > 0">
              <q-list>
                <q-item v-for="task in urgentTasks" :key="task.id">
                  <q-item-section side>
                    <q-checkbox
                      v-model="task.completed"
                      @update:model-value="saveTasks"
                      color="negative"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label
                      :class="task.completed ? 'text-strike text-grey' : 'text-bold text-negative'"
                    >
                      {{ task.title }}
                    </q-item-label>
                    <q-item-label caption>{{ task.description }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>

            <q-card-section v-else>
              <div class="text-grey text-caption">目前沒有急件 🎉</div>
            </q-card-section>
          </q-card>
        </q-card>

        <!-- 行事曆卡片 -->
        <q-card flat bordered class="q-pa-md q-mb-md">
          <div class="text-subtitle1 text-outline">🗓️ 最近一個月行事曆</div>
          <q-separator spaced />
          <q-list dense>
            <q-item
              v-for="event in upcomingEvents"
              :key="event.id"
              clickable
              @click="goToCalendarWithEvent(event)"
              :class="{ blinking: event.daysLeft <= 7 }"
            >
              <q-item-section avatar>
                <q-icon :name="event.icon" :style="{ color: event.bgcolor }" />
              </q-item-section>
              <q-item-section>
                <q-item-label>
                  <q-icon name="warning" color="negative" v-if="event.daysLeft <= 7" />
                  {{ formatDate(event.start) }} ({{ getWeekday(event.start) }})
                  {{ event.details }} - {{ event.title }}
                </q-item-label>
                <q-item-label caption>
                  {{ event.category }} ・ 剩 {{ event.daysLeft }} 天
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>

            <q-item v-if="upcomingEvents.length === 0">
              <q-item-section>
                <q-item-label caption>這週還沒有任何待辦事項</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>

        <!-- About Me -->
        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle1 text-outline">👨‍💻 About Me</div>
          <q-separator spaced />
          <div class="q-mt-sm">
            I'm a passionate full-stack developer who enjoys writing clean code and sharing
            knowledge. On this blog, you'll find articles about JavaScript, Vue, backend,
            productivity, and more.
          </div>
          <q-btn
            flat
            round
            icon="mdi-github"
            @click="openLink('https://github.com/cbad75112?tab=projects')"
          />
          <q-btn flat round icon="mdi-twitter" @click="openLink('https://x.com/cbad75116')" />
          <q-btn
            flat
            round
            icon="mdi-facebook"
            @click="openLink('https://www.facebook.com/chen.ke.cheng.780624/')"
          />
          <q-btn
            flat
            round
            icon="mdi-twitch"
            @click="openLink('https://www.twitch.tv/cbad75112')"
          />
          <q-btn
            flat
            round
            icon="mdi-youtube"
            @click="openLink('https://www.youtube.com/@%E4%B8%8B%E5%B7%B4-v3z')"
          />
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useQuasar } from 'quasar'
  // import { date as qDate } from 'quasar'
  // const selectedFilterTags = ref([])
  const upcomingEvents = ref([])
  const slide = ref(1)
  const searchQuery = ref('')

  const tasks = ref([])
  const urgentTasks = ref([])

  function saveTagsToLocalStorage() {
    localStorage.setItem('allTagsOptions', JSON.stringify(allTagsOptions.value))
  }

  // const tags = computed(() => allTagsOptions)
  const $q = useQuasar()
  // const isDark = computed(() => $q.dark.isActive)
  // const currentPage = ref(1)
  // const pageSize = 5
  const router = useRouter()
  const images = ref(['2.jpeg', '3.jpeg'])
  // const latestPosts = []
  const baseUrl = import.meta.env.BASE_URL
  const notes = ref([])

  const workEndTimeStr = localStorage.getItem('work-end-time') || '17:30'
  const remainingTime = ref('')
  const intervalId = ref(null)

  function updateCountdown() {
    const now = new Date()
    const [hours, minutes] = workEndTimeStr.split(':').map(Number)
    const end = new Date(now)
    end.setHours(hours, minutes, 0, 0)

    const diff = end.getTime() - now.getTime()
    if (diff <= 0) {
      remainingTime.value = '✅ 已下班，祝你今天順利～'
      return
    }

    const h = Math.floor(diff / (1000 * 60 * 60))
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    remainingTime.value = `⏳ 還有 ${h} 小時 ${m} 分鐘下班`
  }

  onMounted(() => {
    const savedNotes = localStorage.getItem('notes')
    if (savedNotes) {
      try {
        notes.value = JSON.parse(savedNotes)
      } catch {
        notes.value = []
      }
    }

    const imagePaths = import.meta.glob('/public/images/*.{jpg,jpeg,png}', { eager: true })
    images.value = Object.keys(imagePaths).map(path => path.replace('/public', ''))
    updateCountdown()
    intervalId.value = setInterval(updateCountdown, 60 * 1000)

    // 載入行事曆資料
    const savedEvents = localStorage.getItem('calendarEvents')
    if (savedEvents) {
      try {
        allEvents.value = JSON.parse(savedEvents)
      } catch {
        allEvents.value = []
      }
    }
    loadUpcomingEvents()

    const saved = localStorage.getItem('allTagsOptions')

    if (saved) {
      try {
        allTagsOptions.value = JSON.parse(saved)
      } catch (e) {
        console.log(e)
        allTagsOptions.value = [...defaultTags]
        saveTagsToLocalStorage()
      }
    } else {
      allTagsOptions.value = [...defaultTags]
      saveTagsToLocalStorage()
    }

    loadTasks()
    fetchNotes()
  })

  const username = 'cbad75112'
  const repo = 'shabablog'
  const notesFolder = 'notes'
  // 讀取 GitHub 筆記清單
  const fetchNotes = async () => {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${username}/${repo}/contents/src/${notesFolder}`
      )
      const data = await res.json()
      const allNotes = []

      for (const item of data) {
        if (item.type === 'dir') {
          const subRes = await fetch(
            `https://api.github.com/repos/${username}/${repo}/contents/${item.path}`
          )
          const subData = await subRes.json()
          subData
            .filter(f => f.name.endsWith('.md'))
            .forEach(f => {
              allNotes.push({
                name: f.name.replace('.md', ''),
                path: f.path,
                category: item.name,
                url: f.download_url
              })
            })
        } else if (item.name.endsWith('.md')) {
          allNotes.push({
            name: item.name.replace('.md', ''),
            path: item.path,
            category: '未分類',
            url: item.download_url
          })
        }
      }

      notes.value = allNotes
    } catch (err) {
      console.error('抓取 GitHub 筆記清單失敗', err)
    }
  }

  const openNote = note => {
    window.open(note.url, '_blank')
  }
  // 載入任務資料
  const loadTasks = () => {
    const stored = localStorage.getItem('workTasks')
    if (stored) {
      tasks.value = JSON.parse(stored)
      urgentTasks.value = tasks.value.filter(t => t.urgent && !t.completed).slice(0, 5) // 顯示最多 5 筆
    }
  }

  // 更新完成狀態
  const saveTasks = () => {
    localStorage.setItem('workTasks', JSON.stringify(tasks.value))
    urgentTasks.value = tasks.value.filter(t => t.urgent && !t.completed).slice(0, 5)
  }

  //行事曆
  const allEvents = ref([])

  // 清除時間只剩日期
  function clearTime(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
  }

  // 假設 myCalendarEvents 的格式
  // { id, date, time, title, tags, category }

  // 載入最近一個月行事曆 (myCalendarEvents 格式)
  function loadUpcomingEvents() {
    // 從 localStorage 拿資料，key 你可自己改，示範用 "myCalendarEvents"
    const raw = localStorage.getItem('myCalendarEvents')
    const allEvents = raw ? JSON.parse(raw) : []

    const today = clearTime(new Date())
    const oneMonthLater = new Date(today)
    oneMonthLater.setDate(today.getDate() + 30)

    upcomingEvents.value = allEvents
      .filter(evt => {
        const evtDate = clearTime(new Date(evt.start))
        return evtDate >= today && evtDate <= oneMonthLater
      })
      .map(evt => {
        const daysLeft = Math.ceil((clearTime(new Date(evt.start)) - today) / (1000 * 60 * 60 * 24))
        return { ...evt, daysLeft }
      })
      .sort((a, b) => new Date(a.start) - new Date(b.start))
  }

  function getWeekday(dateStr) {
    const days = ['日', '一', '二', '三', '四', '五', '六']
    const date = new Date(dateStr)
    return isNaN(date) ? '' : days[date.getDay()]
  }

  function goToCalendarWithEvent(event) {
    router.push({ name: 'calendar', query: { selectedId: event.id } })
  }

  // 格式化日期顯示成 yyyy/MM/dd
  function formatDate(dateStr) {
    const d = new Date(dateStr)
    if (isNaN(d)) return ''
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}/${m}/${day}`
  }
  // function formatDate(dateStr) {
  //   return qDate.formatDate(dateStr, 'YYYY/MM/DD (ddd)')
  // }

  // const combined = computed(() => {
  //   const all = [
  //     ...latestPosts,
  //     ...notes.value.map((n, i) => ({
  //       id: `n${i}`,
  //       title: n.title,
  //       date: n.datetime,
  //       category: n.category,
  //       tags: n.tags,
  //       type: 'note'
  //     }))
  //   ]

  //   const q = searchQuery.value.toLowerCase()

  //   const sorted = all.sort((a, b) => {
  //     const dateA = parseCustomDate(a.date)
  //     const dateB = parseCustomDate(b.date)
  //     return dateB - dateA // 新到舊
  //   })

  //   return searchQuery.value ? sorted.filter(item => item.title.toLowerCase().includes(q)) : sorted
  // })

  // function parseCustomDate(dateStr) {
  //   if (!dateStr) return new Date(0)

  //   const [datePart, timePart] = dateStr.split(' ')
  //   const [year, month, day] = datePart.split('/').map(Number)

  //   const timeMatch = timePart.match(/^(上午|下午)(\d{1,2}):(\d{2}):(\d{2})$/)
  //   if (!timeMatch) return new Date(0)

  //   const [, meridiem, hourStr, minuteStr, secondStr] = timeMatch
  //   let hour = Number(hourStr)
  //   const minute = Number(minuteStr)
  //   const second = Number(secondStr)

  //   // 轉換為 24 小時制
  //   if (meridiem === '下午' && hour < 12) {
  //     hour += 12
  //   } else if (meridiem === '上午' && hour === 12) {
  //     hour = 0
  //   }

  //   // 組合為 ISO 格式時間字串
  //   const isoString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`

  //   return new Date(isoString)
  // }

  const allTagsOptions = ref([])

  const defaultTags = [
    'Vue',
    'quasar',
    'JavaScript',
    'VSCode',
    'Backend',
    'C#',
    'Visual Basic',
    '工作'
  ]

  // 調整 combined 計算屬性，加入多標籤篩選邏輯
  // const filteredCombined = computed(() => {
  //   let filtered = combined.value
  //   // 如果有篩選標籤，過濾條件：文章標籤陣列須包含全部被選標籤(AND邏輯)
  //   if (selectedFilterTags.value.length > 0) {
  //     filtered = filtered.filter(post => {
  //       if (!post.tags || typeof post.tags !== 'string') return false

  //       const postTagArray = post.tags
  //         .split(',')
  //         .map(t => t.trim())
  //         .filter(t => t)

  //       // 檢查 postTagArray 是否包含所有篩選標籤 (AND 邏輯)
  //       return selectedFilterTags.value.every(t => postTagArray.includes(t))
  //     })
  //   }

  //   // 搜尋條件
  //   if (searchQuery.value) {
  //     const q = searchQuery.value.toLowerCase()
  //     filtered = filtered.filter(item => item.title.toLowerCase().includes(q))
  //   }

  //   return filtered
  // })

  // const totalPages = computed(() => Math.ceil(filteredCombined.value.length / pageSize))

  // function goToPost(post) {
  //   if (post.type === 'note') {
  //     router.push({ name: 'notes', query: { selectedId: post.title } })
  //   } else if (post.link) {
  //     window.open(post.link, '_blank')
  //   }
  // }

  function openLink(url) {
    window.open(url, '_blank')
  }

  // 切換篩選標籤（多選）
  // function toggleTagFilter(tag) {
  //   const idx = selectedFilterTags.value.indexOf(tag)
  //   if (idx === -1) {
  //     selectedFilterTags.value.push(tag)
  //   } else {
  //     selectedFilterTags.value.splice(idx, 1)
  //   }
  //   currentPage.value = 1 // 篩選時回到第1頁
  // }

  // const paginatedCombined = computed(() => {
  //   const start = (currentPage.value - 1) * pageSize
  //   return filteredCombined.value.slice(start, start + pageSize)
  // })

  // function getChipStyle(tag) {
  //   const selected = selectedFilterTags.value.includes(tag)
  //   if (selected) {
  //     return 'background: #3f51b5; color: white;'
  //   } else {
  //     return isDark.value
  //       ? 'background: transparent; border: 1px solid #3f51b5; color: white;'
  //       : 'background: transparent; border: 1px solid #3f51b5; color: #3f51b5;'
  //   }
  // }
</script>

<style>
  .carousel-img {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    display: block;
    margin: 0 auto;
    user-select: none;
  }

  /* Carousel 箭頭調色 */
  .q-carousel__control {
    color: #2c3e50 !important;
    /* 深藍色箭頭，白底好看 */
  }

  /* 暗黑模式下改成淺色 */
  body.body--dark .q-carousel__control {
    color: #eee !important;
  }

  .banner-glow {
    animation: fadeInGlow 2s ease;
    position: relative;
    overflow: hidden;
  }
  .text-outline {
    text-shadow:
      -1px -1px 0 #a1c4fd,
      1px -1px 0 #a1c4fd,
      -1px 1px 0 #a1c4fd,
      1px 1px 0 #a1c4fd;
  }

  .banner-glow::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
    background: linear-gradient(270deg, #a18cd1, #fbc2eb, #8ec5fc, #e0c3fc, #a1c4fd, #a18cd1);
    background-size: 600% 600%;
    animation: bannerFlow 12s ease infinite;
    opacity: 1;
  }

  .banner-glow > * {
    position: relative;
    z-index: 1;
  }

  @keyframes bannerFlow {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  @keyframes fadeInGlow {
    0% {
      opacity: 0;
      transform: translateY(-20px);
    }

    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* ✅ Blog 卡片 hover 效果 */
  .blog-card {
    border-radius: 12px;
    transition:
      transform 0.2s,
      box-shadow 0.2s,
      border 0.3s;
    position: relative;
    overflow: hidden;
    background-color: #f5f7fa;
  }

  body.body--dark .blog-card {
    background-color: var(--q-color-grey-10);
  }

  .blog-card:hover {
    /* transform: translateY(-6px); */
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
    border: 1px solid var(--q-color-primary);
  }

  .blog-card::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s ease;
  }

  .blog-card:hover::after {
    left: 100%;
  }

  /* ✅ Blog 封面圖 */
  .blog-cover {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }

  /* ✅ 文章標題 */
  .blog-card .text-h6 {
    font-weight: 700;
    font-size: 1.4rem;
    line-height: 1.3;
    margin-bottom: 0.4rem;
    color: #ffffff;
  }

  body.body--dark .blog-card .text-h6 {
    color: var(--q-color-grey-2);
  }

  /* ✅ 日期與分類 */
  .blog-card .text-caption {
    font-weight: 500;
    font-size: 0.85rem;
    letter-spacing: 0.02em;
    color: #657786;
  }

  body.body--dark .blog-card .text-caption {
    color: var(--q-color-grey-5);
  }

  /* ✅ 文章摘要（若啟用） */
  .blog-card .text-body2 {
    font-weight: 400;
    font-size: 1rem;
    line-height: 1.5;
    color: #4a4a4a;
    margin-top: 0.5rem;
  }

  body.body--dark .blog-card .text-body2 {
    color: var(--q-color-grey-4);
  }

  .blog-card:hover {
    cursor: pointer;
    background-color: #f5f7fa;
  }

  body.body--dark .blog-card:hover {
    background-color: #1e1e1e;
  }

  /* ✅ 搜尋框聚焦效果 */
  .q-input:focus-within {
    box-shadow: 0 0 8px rgba(63, 81, 181, 0.5);
    border-radius: 8px;
    transition: box-shadow 0.3s;
  }

  .q-input {
    border-radius: 8px;
    overflow: hidden;
  }

  .q-input__control {
    background-color: rgba(255, 255, 255, 0.85);
  }

  body.body--dark .q-input__control {
    background-color: rgba(50, 50, 50, 0.85);
  }

  /* ✅ Tags hover 效果 */
  .q-chip {
    transition: all 0.2s;
  }

  .q-chip:hover {
    background-color: #3f51b5 !important;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(63, 81, 181, 0.3);
  }

  /* ✅ 暗黑主題下 hover 背景色調整 */
  :deep(body.body--dark) .hoverable-item:hover {
    background-color: var(--q-color-grey-9);
  }

  /* ✅ 基本 hoverable-item 支援（已內建） */
  .hoverable-item {
    border-radius: 8px;
    transition: background-color 0.3s;
  }

  .hoverable-item:hover {
    background-color: var(--q-color-grey-3);
  }

  /* ===== 側邊欄區塊標題 ===== */
  .q-card .text-subtitle1 {
    font-weight: 600;
    font-size: 1.25rem;
    margin-bottom: 0.6rem;
    color: #ffffff;
  }

  body.body--dark .q-card .text-subtitle1 {
    /* color: var(--q-color-grey-2); */
    color: var(--q-color-grey-2);
  }

  /* ===== 側邊欄文字內容 ===== */
  .q-card .q-mt-sm {
    font-weight: 400;
    font-size: 1rem;
    color: #3b3b3b;
    line-height: 1.5;
  }

  body.body--dark .q-card .q-mt-sm {
    color: var(--q-color-grey-4);
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }

    50% {
      opacity: 0.3;
    }
  }

  .blinking {
    animation: blinkingText 1s infinite;
  }
  @keyframes blinkingText {
    0% {
      color: red;
    }
    50% {
      color: orange;
    }
    100% {
      color: red;
    }
  }

  .my-custom-font {
    font-family: 'Cubic11', sans-serif;
  }

  .glow-border-wrapper {
    position: relative;
    border-radius: 16px;
    padding: 2px; /* 邊框寬度 */
    background: transparent;
    transition: transform 0.3s ease;
  }

  .glow-border-wrapper::before {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    border-radius: 18px;
    background: linear-gradient(
      45deg,
      #a18cd1,
      #fbc2eb,
      #8ec5fc,
      #e0c3fc,
      #cfd9df,
      #a1c4fd,
      #a18cd1,
      /* 開頭色也做收尾，順色可無縫循環 */ #fbc2eb,
      #8ec5fc
    );
    background-size: 600% 600%;
    background-position: 0% 50%;
    z-index: 0;
    opacity: 0;
    transition: opacity 0.3s ease;
    animation: glow-border 3s linear infinite;
  }

  .glow-border-wrapper:hover::before {
    opacity: 1;
  }

  .glow-border-content {
    position: relative;
    z-index: 1;
    border-radius: 14px;
    overflow: hidden;
  }

  @keyframes glow-border {
    0% {
      background-position: 0% 50%;
    }
    100% {
      background-position: 100% 50%;
    }
  }

  .text-outline {
    text-shadow:
      -1px -1px 0 #a1c4fd,
      1px -1px 0 #a1c4fd,
      -1px 1px 0 #a1c4fd,
      1px 1px 0 #a1c4fd;
  }

  .text-note {
    text-shadow:
      -1px -1px 0 #aaa9a9,
      1px -1px 0 #aaa9a9,
      -1px 1px 0 #aaa9a9,
      1px 1px 0 #aaa9a9;
  }
</style>
