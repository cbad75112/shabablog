<template>
  <div class="q-pa-md row justify-center" style="max-width: 1500px; margin: auto">
    <!-- 左側：行事曆 -->
    <div class="col-12 col-md-7 col-lg-8">
      <q-card
        flat
        bordered
        class="q-pa-md q-mt-md calendar-card full-width"
        :class="$q.dark.isActive ? 'bg-grey-9 text-white' : ''"
      >
        <!-- 季節圖片橫幅 -->
        <q-img
          :src="seasonImage"
          class="q-mb-md"
          style="border-radius: 12px; max-height: 200px; object-fit: cover"
          spinner-color="primary"
          alt="Season Banner"
        />

        <!-- 工具列 -->
        <q-toolbar class="q-pb-sm q-gutter-sm items-center">
          <q-toolbar-title>
            <div>
              <div>民國 {{ getMinguoYear(currentYear) }} 年</div>
              <div class="text-h5">🗓️ 我的行事曆</div>
              <!-- <div class="text-h6">{{ currentMonth + 1 }} 月</div> -->
            </div>
          </q-toolbar-title>

          <q-btn flat round icon="chevron_left" @click="changeMonth(-1)" />
          <q-btn flat round icon="event" @click="goToToday" />
          <q-btn flat round icon="chevron_right" @click="changeMonth(1)" />

          <q-select
            dense
            outlined
            emit-value
            map-options
            v-model="currentYear"
            :options="yearOptions"
            style="width: 100px"
            :dark="$q.dark.isActive"
            label="年份"
            class="q-ml-sm"
          />
          <q-select
            dense
            outlined
            emit-value
            map-options
            v-model="currentMonth"
            :options="monthOptions"
            style="width: 90px"
            :dark="$q.dark.isActive"
            label="月份"
            class="q-ml-sm"
          />

          <q-space />
        </q-toolbar>

        <!-- 日曆格子 -->
        <div class="calendar-grid">
          <div
            class="calendar-day-header"
            v-for="(d, idx) in weekDays"
            :key="d"
            :class="{ 'weekend-header': idx === 0 || idx === 6 }"
          >
            {{ d }}
          </div>
          <button
            v-for="(date, idx) in calendarDays"
            :key="idx"
            :class="[
              'calendar-day',
              {
                today: isToday(date),
                selected: isSelected(date),
                holiday: isHoliday(date),
                weekend: isWeekend(date)
              },
              $q.dark.isActive ? 'calendar-day-dark' : ''
            ]"
            :disabled="!date"
            style="min-height: 125px; min-width: 125px"
            @click="date && onDateClick(formatDate(date))"
          >
            <div class="day-number">{{ date ? date.getDate() : '' }}</div>
            <div v-if="date">
              <!-- 國定假日名稱 -->
              <div
                v-if="isHoliday(date) && getHolidayName(date)"
                class="holiday-pill"
                style="font-size: 16px"
              >
                {{ getHolidayName(date) }}
              </div>

              <!-- 事件少於等於3個，直接顯示卡片 -->
              <template v-if="getEventsForDate(formatDate(date)).length <= 1">
                <div
                  v-for="evt in getEventsForDate(formatDate(date))"
                  :key="evt.id"
                  class="event"
                  @click.stop="editEvent(evt)"
                >
                  {{ evt.title }}
                </div>
              </template>

              <!-- 超過3個事件：使用下拉選單 -->
              <template v-else>
                <q-select
                  dense
                  outlined
                  :options="
                    getEventsForDate(formatDate(date)).map(evt => ({
                      label: evt.title,
                      value: evt
                    }))
                  "
                  label="事件列表"
                  hide-dropdown-icon
                  emit-value
                  map-options
                  @update:model-value="editEvent"
                  :dark="$q.dark.isActive"
                  class="event-select"
                  style="margin-top: 4px"
                />
              </template>
            </div>
          </button>
        </div>
      </q-card>
    </div>

    <!-- 右側：新增/編輯區 -->
    <div class="col-12 col-md-5 col-lg-4 q-pl-md">
      <q-card
        flat
        bordered
        class="q-pa-md q-mt-md calendar-card full-width"
        :class="$q.dark.isActive ? 'bg-grey-9 text-white' : ''"
      >
        <q-card-section
          class="text-h6 q-pa-md"
          style="border-bottom: 1px solid var(--q-color-grey-4)"
        >
          {{ dialog.editing ? '編輯待辦' : '新增待辦' }} - {{ dialog.event.date }}
        </q-card-section>

        <q-card-section class="q-pt-none q-pb-md">
          <q-input
            v-model="dialog.event.title"
            label="標題"
            dense
            :dark="$q.dark.isActive"
            :rules="[val => !!val || '標題不能為空']"
            lazy-rules
          />
          <q-input
            v-model="dialog.event.time"
            label="時間 (HH:mm)"
            mask="##:##"
            dense
            class="q-mt-sm"
            :dark="$q.dark.isActive"
            placeholder="可不填"
          />
          <q-input
            v-model="dialog.event.note"
            label="備註"
            type="textarea"
            dense
            class="q-mt-sm"
            autogrow
            maxlength="200"
            counter
            :dark="$q.dark.isActive"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pr-md q-pb-md">
          <q-btn flat label="刪除" v-if="dialog.editing" color="negative" @click="deleteEvent" />
          <q-btn flat label="儲存" color="primary" @click="saveEvent" />
        </q-card-actions>
      </q-card>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted, watch, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useQuasar } from 'quasar'

  const $q = useQuasar()

  const route = useRoute()
  const router = useRouter()

  const today = new Date()
  const currentYear = ref(today.getFullYear())
  const currentMonth = ref(today.getMonth())

  const selectedDate = ref(null)

  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  const holidays = reactive({})

  const events = ref([])

  const dialog = reactive({
    visible: false,
    editing: false,
    event: {
      id: '',
      date: '',
      title: '',
      time: '',
      note: ''
    }
  })

  function getHolidayName(date) {
    const formatted = formatDate(date)

    switch (holidays[formatted]) {
      case '春節':
        monthlyBannerImage.value = '/season-banners/chinese_new_year.jpg'
        break
      case '兒童節及民族掃墓節':
        monthlyBannerImage.value = '/season-banners/child_tomb.jpg'
        break
      case '端午節':
        monthlyBannerImage.value = '/season-banners/dragon_boat.jpg'
        break
      case '中秋節':
        monthlyBannerImage.value = '/season-banners/mid_autumn.jpg'
        break
      default:
    }
    return holidays[formatted] || ''
  }

  function loadEvents() {
    const saved = localStorage.getItem('calendar-events')
    events.value = saved ? JSON.parse(saved) : []
  }

  function saveToLocal() {
    localStorage.setItem('calendar-events', JSON.stringify(events.value))
  }

  function formatDate(date) {
    if (!date) return ''
    const y = date.getFullYear()
    const m = (date.getMonth() + 1).toString().padStart(2, '0')
    const d = date.getDate().toString().padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const calendarDays = ref([])

  function buildCalendar() {
    calendarDays.value = []
    const firstDay = new Date(currentYear.value, currentMonth.value, 1)
    const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
    const startWeekDay = firstDay.getDay()

    for (let i = 0; i < startWeekDay; i++) {
      calendarDays.value.push(null)
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      calendarDays.value.push(new Date(currentYear.value, currentMonth.value, d))
    }
    while (calendarDays.value.length < 42) {
      calendarDays.value.push(null)
    }
  }

  function changeMonth(offset) {
    let m = currentMonth.value + offset
    let y = currentYear.value
    if (m < 0) {
      m = 11
      y -= 1
    } else if (m > 11) {
      m = 0
      y += 1
    }
    currentMonth.value = m
    currentYear.value = y
    buildCalendar()
  }

  function goToToday() {
    currentYear.value = today.getFullYear()
    currentMonth.value = today.getMonth()
    buildCalendar()
  }

  function onDateClick(date) {
    dialog.visible = true
    dialog.editing = false
    dialog.event = {
      id: Date.now(),
      date,
      title: '',
      time: '',
      note: ''
    }
    selectedDate.value = date
    router.replace({ query: { ...route.query, selectedId: undefined } })
  }

  function editEvent(evt) {
    dialog.visible = true
    dialog.editing = true
    dialog.event = { ...evt }
    selectedDate.value = evt.date
    router.replace({ query: { ...route.query, selectedId: evt.id } })
  }

  function saveEvent() {
    if (!dialog.event.title) {
      alert('標題不能為空')
      return
    }
    const idx = events.value.findIndex(e => e.id === dialog.event.id)
    if (idx >= 0) {
      events.value[idx] = { ...dialog.event }
    } else {
      events.value.push({ ...dialog.event })
    }
    saveToLocal()
    selectedDate.value = dialog.event.date
    dialog.visible = false
  }

  function deleteEvent() {
    events.value = events.value.filter(e => e.id !== dialog.event.id)
    saveToLocal()
    dialog.visible = false
    dialog.event.title = ''
    dialog.event.time = ''
    dialog.event.note = ''
    selectedDate.value = null
    router.replace({ query: { ...route.query, selectedId: undefined } })
  }

  function getEventsForDate(date) {
    return events.value.filter(e => e.date === date)
  }

  function isToday(date) {
    if (!date) return false
    const t = new Date()

    return (
      date.getFullYear() === t.getFullYear() &&
      date.getMonth() === t.getMonth() &&
      date.getDate() === t.getDate()
    )
  }

  function isSelected(date) {
    if (!date || !selectedDate.value) return false
    return formatDate(date) === selectedDate.value
  }

  function isHoliday(date) {
    if (!date) return false
    return holidays[formatDate(date)] !== undefined
  }

  function isWeekend(date) {
    if (!date) return false
    const day = date.getDay()
    return day === 0 || day === 6
  }

  function getMinguoYear(year) {
    return year - 1911
  }

  const monthlyBannerImage = ref('')

  async function loadHolidays(year) {
    try {
      const month = currentMonth.value + 1
      if ([12, 1, 2].includes(month)) monthlyBannerImage.value = '/season-banners/winter.jpg'
      if ([3, 4, 5].includes(month)) monthlyBannerImage.value = '/season-banners/spring.jpg'
      if ([6, 7, 8].includes(month)) monthlyBannerImage.value = '/season-banners/summer.jpg'
      if ([9, 10, 11].includes(month)) monthlyBannerImage.value = '/season-banners/autumn.jpg'

      const res = await fetch(`https://cdn.jsdelivr.net/gh/ruyut/TaiwanCalendar/data/${year}.json`)
      const data = await res.json()
      data.forEach(item => {
        if (item.isHoliday) {
          const dateStr = `${item.date.slice(0, 4)}-${item.date.slice(4, 6)}-${item.date.slice(6, 8)}`
          holidays[dateStr] = item.description
        }
      })
    } catch (err) {
      console.error('無法載入假日資料', err)
    }
  }

  // 啟動時載入
  onMounted(() => {
    loadEvents()
    buildCalendar()
    loadHolidays(currentYear.value)

    const selectedId = route.query.selectedId
    if (selectedId) {
      const evt = events.value.find(e => e.id.toString() === selectedId)
      if (evt) {
        jumpToDate(evt.date)
        editEvent(evt)
      }
    }
  })

  watch([currentYear, currentMonth], () => {
    buildCalendar()
    loadHolidays(currentYear.value)
  })

  const yearOptions = Array.from({ length: 21 }, (_, i) => today.getFullYear() - 10 + i)
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    label: `${i + 1} 月`,
    value: i
  }))

  // 加入此 function：根據事件日期跳轉年月並重建月曆
  function jumpToDate(dateStr) {
    const date = new Date(dateStr)
    if (!isNaN(date)) {
      currentYear.value = date.getFullYear()
      currentMonth.value = date.getMonth()
      buildCalendar()
    }
  }

  const seasonImage = computed(() => {
    if (monthlyBannerImage.value) return monthlyBannerImage.value

    const month = currentMonth.value + 1
    if ([12, 1, 2].includes(month)) return '/season-banners/winter.jpg'
    if ([3, 4, 5].includes(month)) return '/season-banners/spring.jpg'
    if ([6, 7, 8].includes(month)) return '/season-banners/summer.jpg'
    if ([9, 10, 11].includes(month)) return '/season-banners/autumn.jpg'
    return ''
  })
</script>

<style scoped>
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 6px; /* 格子間距 */
    display: grid;
    grid-template-columns: repeat(7, 1fr); /* 7欄平均分 */
    gap: 8px;
    width: 100%;
  }

  .calendar-day-header {
    font-weight: 700;
    text-align: center;
    padding: 6px 0;
    font-size: 14px;
    color: var(--q-color-grey-7);
    user-select: none;
    border-bottom: 1px solid var(--q-color-grey-4);
  }

  .weekend-header {
    color: #e53935;
    /* 紅色六日 */
  }

  /* 深色模式調整星期標題顏色 */
  :deep(.dark) .calendar-day-header {
    color: #90caf9;
    /* 淡藍色 */
  }

  .calendar-day {
    background-color: var(--q-color-grey-2);
    border: 1px solid var(--q-color-grey-4);
    border-radius: 6px;
    cursor: pointer;
    height: 85px;
    padding: 6px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    font-size: 13px;
    transition: background-color 0.3s ease;
    min-width: 0;
    max-width: 100%;
    aspect-ratio: 1 / 1.2; /* 高度約為寬度1.2倍，維持比例 */
    box-sizing: border-box;
  }

  .calendar-day:hover:not(:disabled) {
    background-color: #e3f2fd;
  }

  .calendar-day[disabled] {
    cursor: default;
    background-color: transparent;
    border: none;
  }

  .day-number {
    font-weight: 600;
    margin-bottom: 4px;
  }

  .today {
    border: 2px solid #1976d2;
  }

  .selected {
    background-color: #1976d2;
    color: white;
  }

  .holiday {
    color: #f4511e !important; /* 節日橘色 */
    font-weight: 700;
  }

  /* 深色模式下 */
  .calendar-day-dark {
    background-color: #424242;
    border-color: #616161;
    color: white;
  }

  .calendar-day-dark.today {
    border-color: #90caf9;
  }

  .calendar-day-dark.selected {
    background-color: #90caf9;
    color: black;
  }

  .event {
    background-color: #6a4e4e;
    color: white;
    padding: 2px 6px;
    margin: 2px 0;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  :deep(.q-dark) .event {
    background-color: #a0522d;
    /* 深色主題偏亮一點 */
  }

  .q-btn.flat:hover {
    background-color: rgba(0, 0, 0, 0.08);
  }

  :deep .calendar-day[data-v-4a7fea86] {
    font-size: 20px;
    height: 100px;
  }

  .calendar-card {
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    max-width: 100%;
    overflow-x: auto; /* 超出時可水平滑動 */
  }

  .calendar-day {
    border-radius: 10px;
    box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.08);
  }

  .calendar-day:hover:not(:disabled) {
    background-color: #dcefff;
    box-shadow: 0 0 0 2px #1976d2 inset;
  }

  .calendar-day-dark {
    border-radius: 10px;
    background-color: #424242;
    border-color: #616161;
  }

  /* 加在 style scoped 中 */
  .calendar-day {
    transition:
      background-color 0.3s,
      transform 0.3s ease;
  }

  .calendar-day:hover:not(:disabled) {
    transform: scale(1.02);
  }

  .event {
    animation: fadeIn 0.3s ease;
  }

  .q-dialog__inner--minimized > .q-dialog {
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }

    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* calendar-day 深色 hover 高亮 */
  .calendar-day-dark:hover:not(:disabled) {
    background-color: #616161;
    transform: scale(1.02);
    box-shadow: 0 0 0 2px #90caf9 inset;
  }

  /* 深色模式選單邊框與陰影 */
  .q-select__control {
    border-radius: 8px;
    box-shadow: none;
  }

  :deep(.q-field--dark .q-field__control) {
    background-color: #303030;
    border-color: #616161;
    color: white;
  }

  .calendar-card {
    border-radius: 16px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
    transition: all 0.3s ease;
  }

  .q-select {
    border-radius: 8px;
  }

  :deep .calendar-day-dark[data-v-4a7fea86] {
    background-color: #65655f;
  }

  :deep .calendar-day[data-v-4a7fea86] {
    background-color: #b6b5af;
  }

  .today {
    border: 2px solid #1976d2;
    background-color: #e3f2fd;
  }

  .calendar-day-dark.today {
    border: 2px solid #90caf9;
    background-color: #37474f;
  }

  /* 一般模式 */

  /* 六日紅色字，非國定假日不顯示假日名稱 */
  .calendar-day.weekend {
    color: #e53935;
    font-weight: 700;
    background-color: transparent;
  }

  /* 國定假日字色與半透明紅色背景 */
  .calendar-day.holiday {
    color: #e53935;
    font-weight: 700;
    background-color: rgba(229, 57, 53, 0.15);
  }

  /* 深色模式 */

  .calendar-day-dark.weekend {
    color: #e53935;
    background-color: transparent;
  }

  .calendar-day-dark.holiday {
    color: #e53935;
    background-color: rgba(229, 57, 53, 0.2);
  }

  /* 假日名稱小標籤樣式 */
  .holiday-pill {
    font-size: 11px;
    margin-top: 4px;
    padding: 2px 6px;
    border-radius: 12px;
    background-color: rgba(229, 57, 53, 0.2);
    color: #e53935;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    user-select: none;
    transition:
      background-color 0.3s,
      color 0.3s;
  }

  /* 黑暗模式下的 holiday-pill 顏色調整 */
  :deep(.q-dark) .holiday-pill {
    color: white;
    background-color: rgba(201, 201, 201, 0.2);
  }

  .calendar-day:hover {
    background-color: rgba(0, 0, 0, 0.04);
    cursor: pointer;
  }
  .dark .calendar-day:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }

  .event-select {
    font-size: 12px;
    width: 100%;
  }

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
</style>
