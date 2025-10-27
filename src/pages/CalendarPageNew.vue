<template>
  <div class="subcontent">
    <div class="row justify-center">
      <div style="max-width: 1200px; width: 100%">
        <navigation-bar @today="onToday" @prev="onPrev" @next="onNext" style="box-shadow: none;"/>

        <!-- 顯示今天日期 -->
        <div class="text-h4 q-my-md text-center" >
          {{ formattedToday }}
        </div>

        <q-select
          v-model="selectedTheme"
          :options="themesList"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          outlined
          dense
          label="選擇主題"
          class="q-mb-md"
        />
        <q-calendar-month
          ref="calendar"
          v-model="selectedDate"
          animated
          bordered
          focusable
          hoverable
          no-active-date
          :day-min-height="60"
          :day-height="150"
          :locale="locale"
          @change="onChange"
          @moved="onMoved"
          @click-date="onClickDate"
          :style="selectedTheme"
        >
          <template #week="{ scope: { week, weekdays } }">
            <template v-for="(displayedEvent, index) in getWeekEvents(week, weekdays)" :key="index">
              <div
                :class="badgeClasses(displayedEvent)"
                :style="badgeStyles(displayedEvent, week.length)"
              >
                <div v-if="displayedEvent.event" class="event-card">
                  <div class="event-left">
                    <q-icon
                      v-if="displayedEvent.event.icon"
                      :name="displayedEvent.event.icon"
                      size="sm"
                      class="q-mr-xs"
                    />
                    <span class="title">
                      {{ displayedEvent.event.title }}
                    </span>
                    <q-tooltip>{{ displayedEvent.event.details }}</q-tooltip>
                  </div>

                  <!-- holiday 不顯示編輯刪除 -->
                  <div
                    v-if="!String(displayedEvent.event.id).startsWith('holiday-')"
                    class="event-actions"
                  >
                    <q-btn
                    v-if="authStore.mode === 'admin'"
                      dense
                      flat
                      round
                      size="sm"
                      color="white"
                      icon="edit"
                      @click.stop="openEditDialog(displayedEvent.event)"
                    />
                    <q-btn
                    v-if="authStore.mode === 'admin'"
                      dense
                      flat
                      round
                      size="sm"
                      color="white"
                      icon="delete"
                      @click.stop="deleteEvent(displayedEvent.event.id)"
                    />
                  </div>
                </div>
              </div>
            </template>
          </template>
        </q-calendar-month>
      </div>
    </div>

    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 400px; max-width: 480px; padding: 16px">
        <q-card-section class="text-h6 q-pa-none q-mb-md">
          {{ editMode ? '編輯事件' : '新增事件' }}
        </q-card-section>

        <q-card-section class="q-pa-none">
          <q-form @submit.prevent="saveEvent" class="q-gutter-md">
            <q-input
              v-model="form.title"
              label="事件標題"
              outlined
              dense
              autofocus
              required
              class="q-mb-sm"
            />

            <q-input
              v-model="form.details"
              label="事件內容"
              outlined
              dense
              type="textarea"
              autogrow
              class="q-mb-sm"
            />

            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input
                  v-model="form.start"
                  type="date"
                  label="開始日期"
                  outlined
                  dense
                  required
                />
              </div>
              <div class="col-6">
                <q-input v-model="form.end" type="date" label="結束日期" outlined dense required />
              </div>
            </div>

            <q-select
              v-model="form.category"
              label="事件分類"
              outlined
              dense
              :options="['工作', '學習', '娛樂', '家庭', '其他']"
              class="q-mb-sm"
            />

            <q-select
              v-model="form.bgcolor"
              label="顏色"
              outlined
              dense
              :options="colorOptions"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              class="q-mb-sm"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon name="circle" :style="{ color: scope.opt.value }" />
                  </q-item-section>
                  <q-item-section>{{ scope.opt.label }}</q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-select
              v-model="form.icon"
              label="Icon"
              outlined
              dense
              :options="iconOptions"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              class="q-mb-sm"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon :name="scope.opt.value" />
                  </q-item-section>
                  <q-item-section>{{ scope.opt.label }}</q-item-section>
                </q-item>
              </template>
            </q-select>

            <div class="q-mt-md flex justify-end">
              <q-btn flat label="取消" v-close-popup />
              <q-btn type="submit" color="primary" label="儲存" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 新增事件按鈕 -->
    <q-btn
    v-if="authStore.mode === 'admin'"
      round
      color="primary"
      icon="add"
      class="q-ma-md"
      style="position: fixed; bottom: 30px; right: 30px; z-index: 2000"
      @click="openAddDialog"
    />
  </div>
</template>

<script setup>
  import {
    QCalendarMonth,
    daysBetween,
    isOverlappingDates,
    parsed,
    today
  } from '@quasar/quasar-ui-qcalendar'
  import { indexOf } from '@quasar/quasar-ui-qcalendar/src/utils/helpers.js'
  import '@quasar/quasar-ui-qcalendar/index.css'

  import { ref, reactive, computed, watch, onMounted } from 'vue'
  import Holidays from 'date-holidays'
  import NavigationBar from 'src/components/NavigationBar.vue'
  import { useQuasar } from 'quasar'
  import { useRoute } from 'vue-router'
  import { useAuthStore } from 'src/stores/useAuthStore'
const authStore = useAuthStore()

  const route = useRoute()
  const $q = useQuasar()

  const calendar = ref(null)
  const selectedDate = ref(today())
  const year = ref(new Date().getFullYear())
  const country = ref('TW')
  const locale = computed(() => 'zh-TW')

  const themes = reactive({
    default: {},
    teal: {
      '--calendar-scrollbar-track': 'linear-gradient(180deg, #4db6ac, #80cbc4)',
      '--calendar-scrollbar-thumb': '#00695c',
      '--calendar-scrollbar-thumb-hover': '#00897b',
      '--calendar-scrollbar-track-dark': 'linear-gradient(180deg, #004d40, #00695c)',
      '--calendar-scrollbar-thumb-dark': '#00bfa5',
      '--calendar-scrollbar-thumb-hover-dark': '#1de9b6',

      '--calendar-border': '#4db6ac 1px solid',
      '--calendar-border-dark': '#80cbc4 1px solid',
      '--calendar-border-radius': '12px' /* 圓潤外框 */,

      '--calendar-border-section': '#80cbc4 1px dashed',
      '--calendar-border-section-dark': '#26a69a 1px dashed',
      '--calendar-border-current': '#009688 2px solid',
      '--calendar-border-current-dark': '#1de9b6 2px solid',

      '--calendar-color': '#004d40',
      '--calendar-color-dark': '#b2dfdb',
      '--calendar-background': 'linear-gradient(180deg, #e0f2f1, #ffffff)',
      '--calendar-background-dark': 'linear-gradient(180deg, #004d40, #00332f)',

      '--calendar-current-color': '#00838f',
      '--calendar-current-color-dark': '#1de9b6',
      '--calendar-current-background': '#ffffff44',
      '--calendar-current-background-dark': '#00695caa',

      '--calendar-disabled-date-color': '#a7c0c0',
      '--calendar-disabled-date-color-dark': '#6d6d6d',
      '--calendar-disabled-date-background': '#cce7e6',
      '--calendar-disabled-date-background-dark': '#1a1a1a',

      '--calendar-active-date-color': '#000000',
      '--calendar-active-date-color-dark': '#ffff66',
      '--calendar-active-date-background': 'linear-gradient(145deg, #1de9b6, #00acc1)',
      '--calendar-active-date-background-dark': 'linear-gradient(145deg, #4db6ac, #00897b)',
      '--calendar-active-date-shadow': '0px 2px 6px rgba(0,0,0,0.25)',

      '--calendar-outside-color': '#00695c',
      '--calendar-outside-color-dark': '#9e9e9e',

      '--calendar-selected-color': '#01579b',
      '--calendar-selected-color-dark': '#80d8ff',
      '--calendar-selected-background': '#cce7ff',
      '--calendar-selected-background-dark': '#004d40',

      '--calendar-mini-selected-label-background': '#4dd0e1',
      '--calendar-mini-selected-label-background-dark': '#00acc1',
      '--calendar-mini-selected-label-color': '#004d40',
      '--calendar-mini-selected-label-color-dark': '#e0f2f1',

      '--calendar-range-color': '#027BE3',
      '--calendar-range-color-dark': '#40c4ff',
      '--calendar-range-background': '#b3e5fc',
      '--calendar-range-background-dark': '#01579b',

      '--calendar-mini-range-hover-color': '#0097a7',
      '--calendar-mini-range-hover-color-dark': '#1de9b6',

      '--calendar-mini-range-firstlast-label-background':
        'linear-gradient(135deg, #4dd0e1, #00acc1)',
      '--calendar-mini-range-firstlast-label-background-dark':
        'linear-gradient(135deg, #26a69a, #004d40)',

      '--calendar-intervals-width': '56px',
      '--calendar-work-week-width': '30px',
      '--calendar-mini-work-week-width': '30px',
      '--calendar-work-week-font-size': '1.05em',
      '--calendar-head-font-weight': '700'
    },
    brown: {
      '--calendar-scrollbar-track': 'linear-gradient(180deg, #a1887f, #d7ccc8)',
      '--calendar-scrollbar-thumb': '#5d4037',
      '--calendar-scrollbar-thumb-hover': '#8d6e63',
      '--calendar-scrollbar-track-dark': 'linear-gradient(180deg, #3e2723, #5d4037)',
      '--calendar-scrollbar-thumb-dark': '#d7ccc8',
      '--calendar-scrollbar-thumb-hover-dark': '#bcaaa4',

      '--calendar-border': '#a1887f 1px solid',
      '--calendar-border-dark': '#bcaaa4 1px solid',
      '--calendar-border-radius': '12px',

      '--calendar-border-current': '#8d6e63 2px solid',
      '--calendar-border-current-dark': '#d7ccc8 2px solid',

      '--calendar-color': '#3e2723',
      '--calendar-color-dark': '#efebe9',
      '--calendar-background': 'linear-gradient(180deg, #efebe9, #ffffff)',
      '--calendar-background-dark': 'linear-gradient(180deg, #3e2723, #1b1b1b)',

      '--calendar-active-date-background': 'linear-gradient(145deg, #a1887f, #8d6e63)',
      '--calendar-active-date-background-dark': 'linear-gradient(145deg, #6d4c41, #3e2723)',
      '--calendar-active-date-shadow': '0px 2px 6px rgba(0,0,0,0.25)'
    },
    'deep purple': {
      '--calendar-scrollbar-track': 'linear-gradient(180deg, #9575cd, #d1c4e9)',
      '--calendar-scrollbar-thumb': '#4527a0',
      '--calendar-scrollbar-thumb-hover': '#673ab7',
      '--calendar-scrollbar-track-dark': 'linear-gradient(180deg, #311b92, #4527a0)',
      '--calendar-scrollbar-thumb-dark': '#b39ddb',
      '--calendar-scrollbar-thumb-hover-dark': '#9575cd',

      '--calendar-border': '#9575cd 1px solid',
      '--calendar-border-dark': '#b39ddb 1px solid',
      '--calendar-border-radius': '12px',

      '--calendar-border-current': '#7e57c2 2px solid',
      '--calendar-border-current-dark': '#d1c4e9 2px solid',

      '--calendar-color': '#311b92',
      '--calendar-color-dark': '#ede7f6',
      '--calendar-background': 'linear-gradient(180deg, #ede7f6, #ffffff)',
      '--calendar-background-dark': 'linear-gradient(180deg, #311b92, #1a237e)',

      '--calendar-active-date-background': 'linear-gradient(145deg, #7e57c2, #5e35b1)',
      '--calendar-active-date-background-dark': 'linear-gradient(145deg, #4527a0, #311b92)',
      '--calendar-active-date-shadow': '0px 2px 6px rgba(0,0,0,0.25)'
    },
    indigo: {
      '--calendar-scrollbar-track': 'linear-gradient(180deg, #7986cb, #c5cae9)',
      '--calendar-scrollbar-thumb': '#283593',
      '--calendar-scrollbar-thumb-hover': '#3949ab',
      '--calendar-scrollbar-track-dark': 'linear-gradient(180deg, #1a237e, #283593)',
      '--calendar-scrollbar-thumb-dark': '#9fa8da',
      '--calendar-scrollbar-thumb-hover-dark': '#7986cb',

      '--calendar-border': '#7986cb 1px solid',
      '--calendar-border-dark': '#9fa8da 1px solid',
      '--calendar-border-radius': '12px',

      '--calendar-border-current': '#5c6bc0 2px solid',
      '--calendar-border-current-dark': '#c5cae9 2px solid',

      '--calendar-color': '#1a237e',
      '--calendar-color-dark': '#e8eaf6',
      '--calendar-background': 'linear-gradient(180deg, #e8eaf6, #ffffff)',
      '--calendar-background-dark': 'linear-gradient(180deg, #1a237e, #0d1336)',

      '--calendar-active-date-background': 'linear-gradient(145deg, #3d5afe, #3949ab)',
      '--calendar-active-date-background-dark': 'linear-gradient(145deg, #283593, #1a237e)',
      '--calendar-active-date-shadow': '0px 2px 6px rgba(0,0,0,0.25)'
    },
    blue: {
      '--calendar-scrollbar-track': 'linear-gradient(180deg, #64b5f6, #bbdefb)',
      '--calendar-scrollbar-thumb': '#1565c0',
      '--calendar-scrollbar-thumb-hover': '#1e88e5',
      '--calendar-scrollbar-track-dark': 'linear-gradient(180deg, #0d47a0, #1565c0)',
      '--calendar-scrollbar-thumb-dark': '#90caf9',
      '--calendar-scrollbar-thumb-hover-dark': '#64b5f6',

      '--calendar-border': '#64b5f6 1px solid',
      '--calendar-border-dark': '#90caf9 1px solid',
      '--calendar-border-radius': '12px',

      '--calendar-border-current': '#1e88e5 2px solid',
      '--calendar-border-current-dark': '#bbdefb 2px solid',

      '--calendar-color': '#0d47a0',
      '--calendar-color-dark': '#e3f2fd',
      '--calendar-background': 'linear-gradient(180deg, #e3f2fd, #ffffff)',
      '--calendar-background-dark': 'linear-gradient(180deg, #0d47a0, #0b3c91)',

      '--calendar-active-date-background': 'linear-gradient(145deg, #2979ff, #1e88e5)',
      '--calendar-active-date-background-dark': 'linear-gradient(145deg, #1565c0, #0d47a0)',
      '--calendar-active-date-shadow': '0px 2px 6px rgba(0,0,0,0.25)'
    }
  })

  const themesList = computed(() =>
    Object.keys(themes).map(theme => ({
      label: theme,
      value: { ...themes[theme] }
    }))
  )
  const selectedTheme = ref({ ...themes.brown })

  // 事件存儲
  const baseEvents = ref([])
  const holidayIconOverrides = ref({})

  const iconOptions = [
    { label: '預設', value: 'event' },
    { label: '派對', value: 'celebration' },
    { label: '燈籠', value: 'emoji_objects' },
    { label: '禮物', value: 'card_giftcard' },
    { label: '國旗', value: 'flag' },
    { label: '出國', value: 'airplane_ticket' },
    { label: '交通', value: 'train' },
    { label: '休假', value: 'beach_access' }
  ]

  const colorOptions = [
    { label: '藍色', value: '#2196F3' },
    { label: '綠色', value: '#4CAF50' },
    { label: '紅色', value: '#F44336' },
    { label: '橘色', value: '#FF9800' },
    { label: '紫色', value: '#9C27B0' },
    { label: '青色', value: '#009688' },
    { label: '灰色', value: '#9E9E9E' }
  ]

  // 載入 / 儲存
  function loadEvents() {
    const saved = localStorage.getItem('myCalendarEvents')
    baseEvents.value = saved ? JSON.parse(saved) : []

    const savedIcons = localStorage.getItem('holidayIconOverrides')
    holidayIconOverrides.value = savedIcons ? JSON.parse(savedIcons) : {}
  }
  function saveEvents() {
    localStorage.setItem('myCalendarEvents', JSON.stringify(baseEvents.value))
    localStorage.setItem('holidayIconOverrides', JSON.stringify(holidayIconOverrides.value))
  }
  onMounted(loadEvents)
  watch(baseEvents, saveEvents, { deep: true })

  // dialog
  const showDialog = ref(false)
  const editMode = ref(false)
  const form = reactive({
    id: null,
    title: '',
    details: '',
    start: '',
    end: '',
    category: '其他',
    bgcolor: '#2196F3',
    icon: 'event'
  })

  function openAddDialog() {
    if(authStore.mode == 'guest') return;
    editMode.value = false
    Object.assign(form, {
      id: null,
      title: '',
      details: '',
      start: selectedDate.value,
      end: selectedDate.value,
      category: '其他',
      bgcolor: '#2196F3',
      icon: 'event'
    })
    showDialog.value = true
  }
  function openEditDialog(event) {
    editMode.value = true
    Object.assign(form, { ...event })
    if (typeof form.icon !== 'string' || form.icon.trim() === '') {
      form.icon = 'event'
    }
    showDialog.value = true
  }
  function saveEvent() {
    if (!form.title || !form.start || !form.end) return

    if (editMode.value) {
      if (!String(form.id).startsWith('holiday-')) {
        const idx = baseEvents.value.findIndex(e => e.id === form.id)
        if (idx !== -1) baseEvents.value[idx] = { ...form }
      }
    } else {
      form.id = Date.now()
      baseEvents.value.push({ ...form })
    }
    saveEvents()
    showDialog.value = false
  }
  function deleteEvent(id) {
    const event = baseEvents.value.find(e => e.id === id)
    if (!event) return

    $q.dialog({
      title: '確認刪除',
      message: `確定要刪除「${event.title}」嗎？`,
      cancel: true,
      persistent: true
    }).onOk(() => {
      baseEvents.value = baseEvents.value.filter(e => e.id !== id)
    })
  }

  // 假日
  const hd = new Holidays(country.value)
  const holidaysRaw = computed(() => [
    ...hd.getHolidays(year.value - 1),
    ...hd.getHolidays(year.value),
    ...hd.getHolidays(year.value + 1)
  ])
  const holidayEvents = computed(() =>
    holidaysRaw.value.map(item => {
      const date = item.date.slice(0, 10)
      const eventId = `holiday-${date}`
      const savedIcon = holidayIconOverrides.value[eventId]
      return {
        id: eventId,
        title: item.name,
        details: item.type,
        start: date,
        end: date,
        bgcolor: 'orange',
        icon: savedIcon || 'event'
      }
    })
  )

  const events = computed(() => [...baseEvents.value, ...holidayEvents.value])

  // 週事件
  function getWeekEvents(week) {
    if (!week || week.length === 0) return []
    const firstDay = parsed(`${week[0].date} 00:00`)
    const lastDay = parsed(`${week[week.length - 1].date} 23:59`)
    if (!firstDay || !lastDay) return []

    const eventsWeek = events.value
      .map((event, id) => {
        const startDate = parsed(`${event.start} 00:00`)
        const endDate = parsed(`${event.end} 23:59`)
        if (startDate && endDate && isOverlappingDates(startDate, endDate, firstDay, lastDay)) {
          const left = daysBetween(firstDay, startDate)
          const right = daysBetween(endDate, lastDay)
          return { id, left, right, size: week.length - (left + right), event }
        }
        return null
      })
      .filter(Boolean)

    const evts = []
    if (eventsWeek.length > 0) {
      const sortedWeek = eventsWeek.sort((a, b) => a.left - b.left)
      sortedWeek.forEach((_, i) => insertEvent(evts, week.length, sortedWeek, i, 0, 0))
    }
    return evts
  }
  function insertEvent(events, weekLength, infoWeek, index, availableDays, level) {
    const iEvent = infoWeek[index]
    if (iEvent && iEvent.left >= availableDays) {
      if (iEvent.left - availableDays) {
        events.push({ size: iEvent.left - availableDays })
      }
      events.push({ size: iEvent.size, event: iEvent.event })
      if (level !== 0) infoWeek.splice(index, 1)
      const currentAvailableDays = iEvent.left + iEvent.size
      if (currentAvailableDays <= weekLength) {
        const indexNextEvent = indexOf(
          infoWeek,
          e => e.id !== iEvent.id && e.left >= currentAvailableDays
        )
        insertEvent(
          events,
          weekLength,
          infoWeek,
          indexNextEvent !== -1 ? indexNextEvent : index,
          currentAvailableDays,
          level + 1
        )
      }
    } else {
      events.push({ size: weekLength - availableDays })
    }
  }

  // 樣式
  function badgeClasses(displayedEvent) {
    if (displayedEvent.event) {
      return {
        'my-event': true,
        'text-white': true,
        'rounded-border': true,
        'q-calendar__ellipsis': true
      }
    }
    return { 'my-void-event': true }
  }
  function badgeStyles(displayedEvent, weekLength) {
    const s = {}
    if (displayedEvent.size !== undefined) {
      s.width = (100 / weekLength) * displayedEvent.size + '%'
    }
    s.backgroundColor = displayedEvent.event?.bgcolor || ''
    return s
  }

  // 導航
  function onToday() {
    calendar.value?.moveToToday()
  }
  function onPrev() {
    calendar.value?.prev()
  }
  function onNext() {
    calendar.value?.next()
  }
  function onMoved(data) {
    console.log('onMoved', data)
  }
  function onChange(data) {
    console.log('onChange', data)
  }
  function onClickDate(data) {
    openAddDialog()
    form.start = data.scope.timestamp.date
    form.end = data.scope.timestamp.date
  }

  // const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const formattedToday = computed(() => {
    const d = new Date(selectedDate.value)
    // ${d.getDate()}日（星期${weekdays[d.getDay()]}）
    return `${d.getMonth() + 1}月 ${d.getFullYear()}年`
  })

  // 先監聽 route.query.selectedId
  const selectedId = ref(route.query.selectedId)

  // 當 selectedId 變或 baseEvents 變時，執行搜尋
  watch(
    [() => selectedId.value, () => baseEvents.value],
    ([newSelectedId, newBaseEvents]) => {
      if (!newSelectedId || newBaseEvents.length === 0) return

      const idNum = Number(newSelectedId)
      const evt = newBaseEvents.find(e => e.id == idNum)
      if (evt) {
        selectedDate.value = evt.start
      } else {
        console.warn('找不到事件ID:', idNum)
      }
    },
    { immediate: true }
  )

  // 如果 route.query.selectedId 會改變，這裡同步 selectedId
  watch(
    () => route.query.selectedId,
    val => {
      selectedId.value = val
    }
  )
</script>

<style scoped lang="scss">
  :deep .q-calendar-month {
    font-size: 1.6em; /* 從1.3em調大 */
  }

  .my-event {
    position: relative;
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
    font-size: 18px;
    height: 36px;
    margin: 1px 0 0 0;
    padding: 6px 12px;
    justify-content: start;
    text-overflow: ellipsis;
    overflow: hidden;
    cursor: pointer;
  }

  .my-void-event {
    display: inline-flex;
    white-space: nowrap;
    height: 1px;
  }

  .text-white {
    color: white;
  }

  .bg-blue {
    background: blue;
  }
  .bg-green {
    background: green;
  }
  .bg-orange {
    background: orange;
  }
  .bg-red {
    background: red;
  }
  .bg-purple {
    background: purple;
  }

  .rounded-border {
    border-radius: 16px;
  }

  /* 事件操作按鈕固定在右側 */
  .event-actions {
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    gap: 2px;
  }
  
</style>
