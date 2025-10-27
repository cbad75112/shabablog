<script setup>
  import { ref, reactive, computed, watch, onMounted } from 'vue'
  import { useQuasar } from 'quasar'
  import { useAuthStore } from 'src/stores/useAuthStore'
  const authStore = useAuthStore()

  const $q = useQuasar()
  const isDark = ref($q.dark.isActive)

  watch(
    () => $q.dark.isActive,
    val => {
      isDark.value = val
    }
  )
  // 預設標籤選項
  const allTagsOptions = ref([])

  const dialogNewNote = ref(false)
  const editing = ref(false)

  const newNote = reactive({
    category: '',
    title: '',
    content: '',
    tags: [] // 新增tags欄位，逗號分隔字串
  })

  const editNote = reactive({
    id: null,
    category: '',
    title: '',
    content: '',
    datetime: '',
    tags: [] // 編輯區的tags欄位，逗號分隔字串
  })

  const notes = ref([])
  const searchQuery = ref('')

  // 用來控制展開狀態，key是分類名稱，value是布林值（true=展開，false=摺疊）
  const expandedGroups = reactive({})

  const resetNewNote = () => {
    newNote.category = ''
    newNote.title = ''
    newNote.content = ''
    newNote.tags = []
  }

  const resetEditNote = () => {
    editNote.id = null
    editNote.category = ''
    editNote.title = ''
    editNote.content = ''
    editNote.datetime = ''
    editNote.tags = []
    editing.value = false
  }

  const saveNotesToStorage = () => {
    // 儲存前將 tags 陣列轉成字串存
    const saveData = notes.value.map(note => ({
      ...note,
      tags: tagsToString(note.tags)
    }))
    localStorage.setItem('notes', JSON.stringify(saveData))
  }

  const loadNotesFromStorage = () => {
    const saved = localStorage.getItem('notes')
    if (saved) {
      const raw = JSON.parse(saved)
      notes.value = raw.map(note => ({
        ...note,
        tags: parseTags(note.tags)
      }))
    }
  }

  // const hasContent = (str) => {
  //   return str && str.trim().length > 0
  // }

  // 新增筆記
  const saveNewNote = () => {
    if (!newNote.category.trim() || !newNote.title.trim() || !newNote.content.trim()) {
      $q.notify({ type: 'negative', message: '請填寫完整的分類、標題與內容' })
      return
    }
    const id = Date.now()
    const datetime = new Date().toLocaleString()
    notes.value.push({
      id,
      category: newNote.category.trim(),
      title: newNote.title.trim(),
      content: newNote.content,
      datetime,
      tags: [...newNote.tags] // 複製陣列
    })
    saveNotesToStorage()
    $q.notify({ type: 'positive', message: '筆記新增成功！' })
    resetNewNote()
    dialogNewNote.value = false
  }

  const selectNote = item => {
    editNote.id = item.id
    editNote.category = item.category
    editNote.title = item.title
    editNote.content = item.content
    editNote.datetime = item.datetime
    editNote.tags = [...(item.tags || [])]
    editing.value = false
  }

  const startEdit = () => {
    if (!editNote.id) {
      $q.notify({ type: 'warning', message: '請先選擇一筆筆記' })
      return
    }
    editing.value = true
  }

  const saveEditNote = () => {
    if (!editNote.category.trim() || !editNote.title.trim() || !editNote.content.trim()) {
      $q.notify({ type: 'negative', message: '請填寫完整的分類、標題與內容' })
      return
    }
    const idx = notes.value.findIndex(n => n.id === editNote.id)
    if (idx !== -1) {
      notes.value[idx] = {
        id: editNote.id,
        category: editNote.category.trim(),
        title: editNote.title.trim(),
        content: editNote.content,
        datetime: new Date().toLocaleString(),
        tags: [...editNote.tags]
      }
      saveNotesToStorage()
      $q.notify({ type: 'positive', message: '筆記更新成功！' })
      editing.value = false
    } else {
      $q.notify({ type: 'negative', message: '找不到要編輯的筆記' })
    }
  }

  const cancelEdit = () => {
    resetEditNote()
  }

  const deleteNote = id => {
    $q.dialog({
      title: '刪除確認',
      message: '確定要刪除此筆記嗎？',
      cancel: true,
      persistent: true
    }).onOk(() => {
      const toDelete = notes.value.find(n => n.id === id)
      notes.value = notes.value.filter(n => n.id !== id)
      saveNotesToStorage()
      if (editNote.id === id) resetEditNote()
      $q.notify({ type: 'info', message: '筆記已刪除' })

      // 如果該分類沒有筆記了，可以移除展開狀態的記錄
      if (toDelete) {
        const hasOther = notes.value.some(n => n.category === toDelete.category)
        if (!hasOther) {
          delete expandedGroups[toDelete.category]
        }
      }
    })
  }

  // 依分類分組
  const groupedNotes = computed(() => {
    // 篩選字串
    const q = (searchQuery.value || '').toLowerCase()

    // 過濾後的筆記
    const filtered = q
      ? notes.value.filter(
          n => n.title.toLowerCase().includes(q) || n.category.toLowerCase().includes(q)
        )
      : notes.value

    // 分組物件
    const groups = {}
    filtered.forEach(note => {
      if (!groups[note.category]) groups[note.category] = []
      groups[note.category].push(note)
    })

    // 轉為陣列格式方便 v-for，並依分類排序
    return Object.entries(groups)
      .map(([category, notes]) => ({ category, notes }))
      .sort((a, b) => a.category.localeCompare(b.category))
  })

  const parseTags = tagsStr => {
    if (!tagsStr) return []
    return tagsStr
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)
  }

  const tagsToString = tagsArr => {
    if (!tagsArr || tagsArr.length === 0) return ''
    return tagsArr.join(', ')
  }

  import { useRoute } from 'vue-router'
  const newTag = ref('')
  const route = useRoute()
  console.log('route.query.selectedId', route.query.selectedId)
  onMounted(() => {
    loadNotesFromStorage()

    const selectedId = route.query.selectedId
    if (selectedId != undefined) {
      searchQuery.value = selectedId

      // 找出對應筆記
      const found = notes.value.find(n => n.title === selectedId)
      if (found) {
        // 展開該筆記的分類
        expandedGroups[found.category] = true

        // 選中該筆記
        selectNote(found)
      }
    }

    const saved = localStorage.getItem('allTagsOptions')
    if (saved) {
      try {
        allTagsOptions.value = JSON.parse(saved)
      } catch (e) {
        console.log(e)
        allTagsOptions.value = []
      }
    } else {
      allTagsOptions.value = [
        '工作',
        'Vue',
        'quasar',
        'Backend',
        'JavaScript',
        'VSCode',
        'C#',
        'Visual Basic'
      ]
      saveTagsToLocalStorage()
    }
  })

  // 儲存至 localStorage
  function saveTagsToLocalStorage() {
    localStorage.setItem('allTagsOptions', JSON.stringify(allTagsOptions.value))
  }

  // 新增標籤（從管理區塊）
  function addNewTag() {
    const trimmed = newTag.value.trim()
    if (trimmed && !allTagsOptions.value.includes(trimmed)) {
      allTagsOptions.value.push(trimmed)
      saveTagsToLocalStorage()
    }
    newTag.value = ''
  }

  // 刪除標籤
  function removeTag(tag) {
    allTagsOptions.value = allTagsOptions.value.filter(t => t !== tag)
    saveTagsToLocalStorage()
  }
</script>

<template>
  <q-page
    class="q-pa-md"
    :class="isDark ? 'bg-dark text-white' : 'bg-white text-black'"
    style="min-width: 1600px"
  >
    <div class="row q-col-gutter-md" style="height: 100vh">
      <!-- 左側：搜尋、筆記列表、新增 -->
      <div class="col-12 col-md-4" style="overflow-y: auto; height: 100%; width: 400px">
        <div class="row items-center q-mb-md">
          <div class="col">
            <q-input
              v-model="searchQuery"
              placeholder="搜尋標題或分類..."
              dense
              debounce="300"
              clearable
              :dark="isDark"
            />
          </div>
          <div class="col-auto">
            <q-btn
              icon="add"
              color="blue-3"
              dense
              round
              flat
              style="margin-left: 5px"
              @click="dialogNewNote = true"
            >
              <q-tooltip>新增筆記</q-tooltip>
            </q-btn>
          </div>
        </div>
        <!-- 標籤管理區塊 -->
        <q-expansion-item
          v-if="authStore.mode === 'admin'"
          icon="settings"
          label="管理標籤"
          dense
          class="q-mt-sm"
          expand-separator
        >
          <!-- 新增標籤輸入欄 -->
          <div class="row items-center q-col-gutter-sm q-mb-sm">
            <q-input
              v-model="newTag"
              label="新增標籤"
              dense
              outlined
              @keyup.enter="addNewTag"
              :dark="isDark"
            />
            <q-btn
              style="margin-left: 5px; margin-top: 5px"
              label="新增"
              color="blue-3"
              dense
              @click="addNewTag"
            />
          </div>

          <!-- 所有標籤列表，可刪除 -->
          <div class="row q-col-gutter-sm q-pa-sm">
            <q-chip
              v-for="(tag, index) in allTagsOptions"
              :key="index"
              color="indigo-1"
              text-color="black"
              class="q-mb-xs"
              removable
              @remove="removeTag(tag)"
            >
              {{ tag }}
            </q-chip>
          </div>
        </q-expansion-item>

        <q-list
          bordered
          separator
          class="bg-grey-1 q-pa-sm rounded"
          :class="isDark ? 'bg-grey-10 text-white' : 'bg-grey-1 text-black'"
          style="max-height: calc(100vh - 80px); overflow-y: auto; font-size: 20px"
        >
          <div v-for="group in groupedNotes" :key="group.category" class="q-mb-md">
            <q-expansion-item
              v-model="expandedGroups[group.category]"
              :label="group.category"
              :header-class="isDark ? 'text-warning' : 'text-primary'"
              dense
              expand-icon="keyboard_arrow_down"
              collapse-icon="keyboard_arrow_right"
            >
              <q-list dense bordered separator>
                <q-item
                  v-for="item in group.notes"
                  :key="item.id"
                  clickable
                  @click="selectNote(item)"
                  :active="editNote.id === item.id"
                  active-class="bg-primary text-white"
                  class="rounded"
                  style="margin-bottom: 6px"
                >
                  <q-item-section>
                    <q-item-label class="text-weight-bold">{{ item.title }}</q-item-label>
                    <q-item-label caption>{{ item.datetime }}</q-item-label>
                  </q-item-section>
                  <q-item-section side top>
                    <q-btn
                      v-if="authStore.mode === 'admin'"
                      dense
                      flat
                      icon="delete"
                      color="negative"
                      @click.stop="deleteNote(item.id)"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>
          </div>
        </q-list>
      </div>

      <!-- 右側：筆記查看與編輯 -->

      <div
        class="col-12 col-md-8"
        style="display: flex; flex-direction: column; height: 100%; gap: 12px"
      >
        <q-card
          flat
          bordered
          class="q-pa-md flex-grow-1"
          :class="isDark ? 'bg-grey-9 text-white' : 'bg-grey-2 text-black'"
          style="overflow-y: auto; width: 1150px"
        >
          <div class="row items-center q-mb-md">
            <div class="col text-h5">📖 查看筆記</div>
            <div class="col-auto" v-if="authStore.mode === 'admin'">
              <q-btn
                v-if="editNote.id && !editing"
                label="編輯"
                color="primary"
                @click="startEdit"
              />
              <q-btn
                v-if="editing"
                label="儲存"
                color="primary"
                class="q-mr-sm"
                @click="saveEditNote"
              />
              <q-btn v-if="editing" label="取消" color="secondary" flat @click="cancelEdit" />
            </div>
          </div>

          <template v-if="editNote.id && !editing">
            <div><b>分類：</b> {{ editNote.category }}</div>
            <div><b>標題：</b> {{ editNote.title }}</div>
            <div>
              <b>標籤：</b>
              <q-chip
                v-for="(tag, index) in editNote.tags"
                :key="index"
                color="indigo"
                text-color="white"
                icon="label"
                dense
                class="q-mr-xs"
              >
                {{ tag }}
              </q-chip>
            </div>

            <div><b>時間：</b> {{ editNote.datetime }}</div>
            <div class="q-mt-sm" v-html="editNote.content" style="font-size: 20px"></div>
          </template>

          <template v-if="editNote.id && editing">
            <q-input dense filled v-model="editNote.category" label="分類" :dark="isDark" />
            <q-input
              dense
              filled
              v-model="editNote.title"
              label="標題"
              class="q-mt-sm"
              :dark="isDark"
            />
            <q-select
              v-model="editNote.tags"
              multiple
              use-chips
              :options="allTagsOptions"
              label="標籤"
              hint="可選多個標籤"
              dense
              :dark="isDark"
            />

            <div class="q-mt-sm" style="flex-grow: 1; display: flex; flex-direction: column">
              <label class="text-subtitle2">內容：</label>
              <q-editor
                v-model="editNote.content"
                :dark="isDark"
                height="350px"
                :toolbar="[
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['link', 'image'],
                  ['clean']
                ]"
                style="flex-grow: 1"
              />
            </div>
          </template>

          <template v-if="!editNote.id">
            <div class="text-subtitle1 text-center text-grey-5 q-pa-md">
              請從左側選擇一筆筆記或新增筆記
            </div>
          </template>
        </q-card>
      </div>
    </div>

    <!-- 新增筆記 Dialog -->
    <q-dialog v-model="dialogNewNote" persistent>
      <q-card
        :class="isDark ? 'bg-grey-9 text-white' : 'bg-white text-black'"
        style="min-width: 700px; max-width: 90vw"
      >
        <q-card-section>
          <div class="text-h6 q-mb-md">新增筆記</div>
          <q-input v-model="newNote.category" label="分類" dense :dark="isDark" :filled="!isDark" />
          <q-input
            v-model="newNote.title"
            label="標題"
            dense
            class="q-mt-sm"
            :dark="isDark"
            :filled="!isDark"
          />
          <q-select
            v-model="newNote.tags"
            multiple
            use-chips
            :options="allTagsOptions"
            label="標籤"
            hint="可選多個標籤"
            dense
            :dark="isDark"
          />
          <div class="q-mt-sm" style="height: 300px">
            <q-editor
              v-model="newNote.content"
              :dark="isDark"
              :toolbar="[
                ['bold', 'italic', 'underline', 'strike'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image'],
                ['clean']
              ]"
            />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="取消" color="secondary" v-close-popup @click="resetNewNote" />
          <q-btn label="儲存" color="primary" @click="saveNewNote" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>
