<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { marked } from 'marked'
import 'github-markdown-css/github-markdown.css'

const $q = useQuasar()
const isDark = computed(() => $q.dark.isActive)

const username = 'cbad75112'
const repo = 'shabablog'
const notesFolder = 'notes'

const notes = ref([])
const loading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('全部')

// 讀取 GitHub 筆記清單
const fetchNotes = async () => {
  loading.value = true
  try {
    const res = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/src/${notesFolder}`)
    const data = await res.json()
    const allNotes = []

    for (const item of data) {
      if (item.type === 'dir') {
        const subRes = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${item.path}`)
        const subData = await subRes.json()
        subData.filter(f => f.name.endsWith('.md')).forEach(f => {
          allNotes.push({
            name: f.name.replace('.md', ''),
            path: f.path,
            category: item.name,
            url: f.download_url,
            content: '',
            expanded: false,
            loading: false
          })
        })
      } else if (item.name.endsWith('.md')) {
        allNotes.push({
          name: item.name.replace('.md', ''),
          path: item.path,
          category: '未分類',
          url: item.download_url,
          content: '',
          expanded: false,
          loading: false
        })
      }
    }
    notes.value = allNotes
  } catch (err) {
    console.error('讀取 GitHub 筆記清單失敗', err)
  } finally {
    loading.value = false
  }
}

// 點擊標題收合，點擊內容不收
const toggleNote = async (note) => {
  if (!note.expanded && !note.content) {
    note.loading = true
    try {
      const res = await fetch(`https://raw.githubusercontent.com/${username}/${repo}/main/${note.path}`)
      const text = await res.text()
      note.content = marked(text)
    } catch (err) {
      console.error('讀取筆記內容失敗', err)
    } finally {
      note.loading = false
    }
  }
  note.expanded = !note.expanded
}

const categories = computed(() => ['全部', ...new Set(notes.value.map(n => n.category))])

const filteredNotes = computed(() => {
  let list = notes.value
  if (selectedCategory.value !== '全部') list = list.filter(n => n.category === selectedCategory.value)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(n => n.name.toLowerCase().includes(q))
  }
  return list
})

onMounted(fetchNotes)
</script>

<template>
  <q-page :class="isDark ? 'bg-dark text-white' : 'bg-grey-1 text-dark'" class="q-pa-md row no-wrap">

    <!-- 側邊分類 -->
    <div class="sidebar q-pa-sm">
      <div class="text-subtitle1 q-mb-sm">📂 筆記分類</div>
      <q-list bordered class="category-list">
        <q-item
          v-for="cat in categories"
          :key="cat"
          clickable
          :active="selectedCategory === cat"
          @click="selectedCategory = cat"
          class="category-item"
          :class="[selectedCategory === cat
            ? (isDark ? 'bg-primary text-white' : 'bg-primary text-white')
            : (isDark ? 'bg-grey-9 text-grey-3' : 'bg-grey-2 text-dark')]"
        >
          <q-item-section>{{ cat }}</q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- 主內容 -->
    <div class="content-area q-pl-lg full-width">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">🧠 我的筆記</div>
        <q-input
          v-model="searchQuery"
          placeholder="搜尋筆記..."
          dense
          outlined
          clearable
          :dark="isDark"
          style="max-width: 280px"
        >
          <template #append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <div v-if="loading" class="flex flex-center q-mt-xl">
        <q-spinner color="primary" size="2em" />
      </div>

      <div v-else-if="filteredNotes.length === 0" class="text-grey text-center q-mt-xl">
        🚫 沒有筆記
      </div>

      <!-- 筆記列表 -->
      <div class="column q-gutter-y-md">
        <q-card
          v-for="note in filteredNotes"
          :key="note.path"
          bordered
          flat
          class="card-hover full-width"
          :class="isDark ? 'bg-grey-9 text-white' : 'bg-white text-dark'"
        >
          <!-- 標題列 -->
          <div
            class="row items-center justify-between cursor-pointer q-mb-sm"
            @click="toggleNote(note)"
          >
            <div class="text-subtitle2 ellipsis">{{ note.name }}</div>
            <q-badge color="primary">{{ note.category }}</q-badge>
          </div>

          <q-separator spaced />

          <!-- 內容 -->
          <div v-if="note.loading" class="text-grey text-center q-my-sm">讀取中...</div>
          <div
            v-if="note.expanded && note.content"
            class="markdown-body"
            v-html="note.content"
            @click.stop
          />
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.sidebar {
  width: 220px;
  border-right: 1px solid rgba(128, 128, 128, 0.2);
}
.category-list {
  border-radius: 8px;
  overflow: hidden;
}
.category-item {
  transition: all 0.2s ease;
}
.category-item:hover {
  transform: translateX(4px);
  background-color: var(--q-primary);
  color: white !important;
}
.card-hover {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  width: 100%;
  margin-bottom: 16px;
  padding: 0.5rem;
}
.card-hover:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}
.markdown-body {
  font-size: 14px;
  line-height: 1.6;
  overflow-wrap: break-word;
  max-height: 500px;
  overflow-y: auto;
  padding: 0.5rem;
  background-color: transparent;
}
.markdown-body::-webkit-scrollbar {
  width: 6px;
}
.markdown-body::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.3);
  border-radius: 6px;
}
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bg-dark .markdown-body {
  background-color: #0d1117;
  color: #c9d1d9;
}
</style>
