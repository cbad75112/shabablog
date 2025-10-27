<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { marked } from 'marked'

const $q = useQuasar()
const isDark = computed(() => $q.dark.isActive)

// ⚙️ 請改成你的 GitHub 帳號與 repo 名稱
const username = 'cbad75112'
const repo = 'shabablog'
const notesFolder = 'notes'

// 筆記資料
const notes = ref([])
const loading = ref(false)
// const selectedNote = ref(null)
const searchQuery = ref('')

// 讀取 notes 資料夾清單
const fetchNotes = async () => {
  loading.value = true
  try {
    const res = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${notesFolder}`)
    const data = await res.json()

    // 過濾出 .md 檔案
    notes.value = data
      .filter(f => f.name.endsWith('.md'))
      .map(f => ({
        name: f.name.replace('.md', ''),
        path: f.path,
        url: f.download_url,
        content: '',
        expanded: false
      }))
  } catch (err) {
    console.error('讀取 GitHub 筆記清單失敗', err)
  } finally {
    loading.value = false
  }
}

// 讀取單篇 Markdown
const loadNoteContent = async (note) => {
  if (note.content) {
    note.expanded = !note.expanded
    return
  }

  note.loading = true
  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/${username}/${repo}/main/${note.path}`
    )
    const text = await res.text()
    note.content = marked(text)
    note.expanded = true
  } catch (err) {
    console.error('讀取筆記內容失敗', err)
  } finally {
    note.loading = false
  }
}

// 搜尋功能
const filteredNotes = computed(() => {
  if (!searchQuery.value.trim()) return notes.value
  const q = searchQuery.value.toLowerCase()
  return notes.value.filter(n => n.name.toLowerCase().includes(q))
})

onMounted(fetchNotes)
</script>

<template>
  <q-page
    class="q-pa-md"
    :class="isDark ? 'bg-dark text-white' : 'bg-grey-1 text-black'"
  >
    <div class="row justify-between items-center q-mb-md">
      <div class="text-h5">📘 GitHub 筆記中心</div>
      <q-input
        v-model="searchQuery"
        placeholder="搜尋筆記標題..."
        dense
        outlined
        clearable
        :dark="isDark"
        style="max-width: 300px"
      />
    </div>

    <q-spinner v-if="loading" color="primary" size="2em" />

    <div v-if="!loading && filteredNotes.length === 0" class="text-grey text-center q-mt-lg">
      🚫 找不到筆記，請確認 GitHub 的 <code>/notes</code> 資料夾中有 .md 檔案
    </div>

    <div class="row q-col-gutter-md">
      <div
        v-for="note in filteredNotes"
        :key="note.name"
        class="col-12 col-md-6"
      >
        <q-card
          bordered
          flat
          class="q-pa-md cursor-pointer transition-all"
          :class="isDark ? 'bg-grey-9 text-white' : 'bg-white text-black'"
          @click="loadNoteContent(note)"
        >
          <div class="row items-center justify-between">
            <div class="text-h6">{{ note.name }}</div>
            <q-icon
              :name="note.expanded ? 'expand_less' : 'expand_more'"
              size="md"
            />
          </div>

          <q-separator spaced />

          <div v-if="note.loading" class="text-grey text-center q-mt-md">
            讀取中...
          </div>

          <div
            v-if="note.expanded && note.content"
            class="markdown-body q-mt-sm"
            v-html="note.content"
          />
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.markdown-body {
  font-size: 16px;
  line-height: 1.6;
}
.cursor-pointer {
  cursor: pointer;
}
.transition-all {
  transition: all 0.2s ease;
}
</style>
