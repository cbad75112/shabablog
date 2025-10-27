<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { marked } from 'marked'

const $q = useQuasar()
const isDark = computed(() => $q.dark.isActive)

const username = 'cbad75112'
const repo = 'shabablog'
const notesFolder = 'notes'

const notes = ref([])
const loading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('全部')

const fetchNotes = async () => {
  loading.value = true
  try {
    const res = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/src/${notesFolder}`)
    const data = await res.json()

    const allNotes = []

    for (const item of data) {
      if (item.type === 'dir') {
        // 📁 處理子資料夾（分類）
        const subRes = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${item.path}`)
        const subData = await subRes.json()

        subData
          .filter(f => f.name.endsWith('.md'))
          .forEach(f => {
            allNotes.push({
              name: f.name.replace('.md', ''),
              path: f.path,
              category: item.name,
              url: f.download_url,
              content: '',
              expanded: false
            })
          })
      } else if (item.name.endsWith('.md')) {
        // 📄 根目錄筆記
        allNotes.push({
          name: item.name.replace('.md', ''),
          path: item.path,
          category: '未分類',
          url: item.download_url,
          content: '',
          expanded: false
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

// 📄 讀取筆記內容
const loadNoteContent = async (note) => {
  if (note.loading) return
  if (!note.content) {
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
  note.expanded = true // 不會自動收起
}

const categories = computed(() => ['全部', ...new Set(notes.value.map(n => n.category))])

const filteredNotes = computed(() => {
  let list = notes.value
  if (selectedCategory.value !== '全部') {
    list = list.filter(n => n.category === selectedCategory.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(n => n.name.toLowerCase().includes(q))
  }
  return list
})

onMounted(fetchNotes)
</script>

<template>
  <q-page :class="isDark ? 'bg-dark text-white' : 'bg-grey-2 text-black'" class="q-pa-md row no-wrap">

    <!-- 🧭 左側分類清單 -->
    <div class="sidebar q-pa-sm">
      <div class="text-h6 q-mb-sm">📂 分類</div>
      <q-list bordered class="category-list">
        <q-item
          v-for="cat in categories"
          :key="cat"
          clickable
          :active="selectedCategory === cat"
          @click="selectedCategory = cat"
          class="q-my-xs rounded-borders"
          :class="[
            isDark
              ? selectedCategory === cat
                ? 'bg-primary text-white'
                : 'bg-grey-9 text-grey-3'
              : selectedCategory === cat
              ? 'bg-primary text-white'
              : 'bg-grey-1 text-dark'
          ]"
        >
          <q-item-section>{{ cat }}</q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- 📝 主內容區 -->
    <div class="content-area q-pl-lg full-width">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h5">📘 我的筆記</div>
        <q-input
          v-model="searchQuery"
          placeholder="搜尋筆記..."
          dense
          outlined
          clearable
          :dark="isDark"
          style="max-width: 300px"
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

      <div class="row q-col-gutter-lg">
        <div v-for="note in filteredNotes" :key="note.path" class="col-12 col-md-6 col-lg-4">
          <q-card
            bordered
            flat
            class="card-hover q-pa-md"
            :class="isDark ? 'bg-grey-9 text-white' : 'bg-white text-dark'"
            @click="loadNoteContent(note)"
          >
            <div class="row items-center justify-between">
              <div class="text-h6 ellipsis">{{ note.name }}</div>
              <q-badge color="primary" align="top">{{ note.category }}</q-badge>
            </div>

            <q-separator spaced />

            <div v-if="note.loading" class="text-grey text-center q-my-sm">讀取中...</div>

            <div
              v-if="note.expanded && note.content"
              class="markdown-body q-mt-sm"
              v-html="note.content"
              @click.stop
            />
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.sidebar {
  width: 200px;
  min-width: 180px;
  border-right: 1px solid rgba(128, 128, 128, 0.3);
}
.category-list {
  border-radius: 8px;
  overflow: hidden;
}
.card-hover {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
}
.markdown-body {
  font-size: 15px;
  line-height: 1.6;
  overflow-wrap: break-word;
}
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rounded-borders {
  border-radius: 8px;
}
</style>
