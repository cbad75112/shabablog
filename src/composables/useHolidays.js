// src/composables/useHolidays.js
import { ref } from 'vue'

const holidays = ref([])

export async function fetchHolidays(year = new Date().getFullYear()) {
  const url = `https://cdn.jsdelivr.net/gh/ruyut/TaiwanCalendar/data/${year}.json`

  try {
    const res = await fetch(url)
    const data = await res.json()
    holidays.value = data.response.holidays.map(h => ({
      name: h.name,
      date: h.date.iso,
      type: h.type
    }))
  } catch (err) {
    console.error('無法取得國定假日:', err)
  }
}

export function isHoliday(d) {
  const target = d.toISOString().slice(0, 10)
  return holidays.value.find(h => h.date === target)
}

export function getHolidayName(d) {
  const found = isHoliday(d)
  return found ? found.name : ''
}
