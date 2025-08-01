<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md text-outline">🔗 工作常用連結</div>

    <!-- 分類管理區塊 -->
    <q-card flat bordered class="q-pa-md q-mb-lg">
      <div class="row items-center q-mb-sm justify-between">
        <div class="text-subtitle1">分類管理</div>
        <q-btn
          icon="add"
          color="primary"
          dense
          round
          flat
          @click="showAddCategoryDialog = true"
          label="新增分類"
          class="q-ml-xs"
        />
      </div>

      <div>
        <q-chip
          v-for="(cat, i) in categories"
          :key="cat"
          removable
          @remove="removeCategory(i)"
          class="q-mr-sm q-mb-sm"
          color="primary"
          text-color="white"
          dense
        >
          {{ cat }}
        </q-chip>
        <div v-if="categories.length === 0" class="text-grey">尚無分類，請點擊右上新增分類。</div>
      </div>
    </q-card>

    <!-- 連結管理區塊 -->
    <q-card flat bordered class="q-pa-md q-mb-md">
      <div class="row q-mb-sm items-center">
        <q-input
          v-model="searchTerm"
          outlined
          dense
          placeholder="搜尋連結名稱或網址"
          class="col"
          clearable
          clear-icon="close"
        />
        <q-select
          v-model="selectedCategory"
          :options="categoriesWithAll"
          label="分類篩選"
          dense
          outlined
          class="q-ml-sm"
          clearable
          clear-icon="close"
          emit-value
          map-options
          style="min-width: 150px"
        />
        <q-btn icon="add" label="新增連結" color="primary" @click="openAddDialog" class="q-ml-sm" />
      </div>

      <q-separator />

      <div v-if="filteredLinks.length === 0" class="text-grey text-center q-mt-md">
        尚無任何符合條件的連結，請點選「新增連結」開始建立。
      </div>

      <q-list v-else class="q-mt-md">
        <q-item
          v-for="{ link, originalIndex } in filteredLinks"
          :key="originalIndex"
          tag="a"
          :href="link.url"
          target="_blank"
          class="rounded-borders shadow-1 q-mb-sm"
          :class="isDark ? 'bg-grey-9 text-white' : 'bg-white text-black'"
        >
          <q-item-section avatar>
            <q-icon name="link" color="primary" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-bold">{{ link.title }}</q-item-label>
            <q-item-label caption>{{ link.url }}</q-item-label>
            <q-item-label caption class="text-grey-6"
              >分類：{{ link.category || '無' }}</q-item-label
            >
          </q-item-section>

          <q-item-section side>
            <q-btn
              flat
              round
              dense
              icon="edit"
              @click.stop.prevent="openEditDialog(originalIndex)"
              :color="isDark ? 'amber' : 'primary'"
            >
              <q-tooltip>編輯</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="delete"
              color="negative"
              @click.stop.prevent="confirmDelete(originalIndex)"
            >
              <q-tooltip>刪除</q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <!-- 編輯/新增連結 Dialog -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ isEditing ? '編輯連結' : '新增連結' }}</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="form.title" label="名稱" filled dense />
          <q-input v-model="form.url" label="網址" filled dense class="q-mt-sm" />
          <q-select
            v-model="form.category"
            :options="categories"
            label="分類"
            filled
            dense
            class="q-mt-sm"
            clearable
            clear-icon="close"
            emit-value
            map-options
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="grey" v-close-popup />
          <q-btn flat label="儲存" color="primary" @click="saveLink" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 新增分類 Dialog -->
    <q-dialog v-model="showAddCategoryDialog" persistent>
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">新增分類</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="newCategory"
            label="分類名稱"
            autofocus
            dense
            clearable
            clear-icon="close"
            @keyup.enter="addCategoryFromDialog"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="grey" v-close-popup @click="resetNewCategory" />
          <q-btn
            flat
            label="新增"
            color="primary"
            :disable="!newCategory.trim()"
            @click="addCategoryFromDialog"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useQuasar } from 'quasar'

  const $q = useQuasar()
  const isDark = computed(() => $q.dark.isActive)

  const storageKeyLinks = 'work-links'
  const storageKeyCategories = 'work-link-categories'

  const workLinks = ref([])
  const categories = ref([])
  const showDialog = ref(false)
  const showAddCategoryDialog = ref(false)
  const isEditing = ref(false)
  const editIndex = ref(-1)
  const form = ref({ title: '', url: '', category: '' })
  const searchTerm = ref('')
  const selectedCategory = ref(null)
  const newCategory = ref('')

  // 讀取資料
  onMounted(() => {
    const storedLinks = localStorage.getItem(storageKeyLinks)
    if (storedLinks) {
      try {
        workLinks.value = JSON.parse(storedLinks)
      } catch (e) {
        console.error('無法解析 workLinks 資料:', e)
      }
    }
    const storedCategories = localStorage.getItem(storageKeyCategories)
    if (storedCategories) {
      try {
        categories.value = JSON.parse(storedCategories)
        if (categories.value.includes('資訊部')) {
          selectedCategory.value = '資訊部'
        }
      } catch (e) {
        console.error('無法解析 categories 資料:', e)
      }
    }
  })

  function saveToStorage() {
    localStorage.setItem(storageKeyLinks, JSON.stringify(workLinks.value))
    localStorage.setItem(storageKeyCategories, JSON.stringify(categories.value))
  }

  function addCategory() {
    const cat = newCategory.value.trim()
    if (!cat) return
    if (!categories.value.includes(cat)) {
      categories.value.push(cat)
      categories.value.sort()
      saveToStorage()
      newCategory.value = ''
    } else {
      $q.notify({ type: 'warning', message: '分類已存在' })
    }
  }

  function addCategoryFromDialog() {
    addCategory()
    showAddCategoryDialog.value = false
  }

  function resetNewCategory() {
    newCategory.value = ''
  }

  function removeCategory(index) {
    const catToRemove = categories.value[index]
    const used = workLinks.value.some(link => link.category === catToRemove)
    if (used) {
      $q.notify({ type: 'negative', message: '該分類有連結使用中，無法刪除' })
      return
    }
    categories.value.splice(index, 1)
    saveToStorage()
  }

  function openAddDialog() {
    isEditing.value = false
    form.value = { title: '', url: '', category: '' }
    showDialog.value = true
  }

  function openEditDialog(index) {
    isEditing.value = true
    editIndex.value = index
    form.value = { ...workLinks.value[index] }
    showDialog.value = true
  }

  function saveLink() {
    if (!form.value.title || !form.value.url) {
      $q.notify({ type: 'negative', message: '名稱與網址為必填欄位' })
      return
    }
    if (form.value.category && !categories.value.includes(form.value.category)) {
      $q.notify({ type: 'negative', message: '請選擇有效的分類' })
      return
    }
    if (isEditing.value && editIndex.value !== -1) {
      workLinks.value[editIndex.value] = { ...form.value }
    } else {
      workLinks.value.push({ ...form.value })
    }
    saveToStorage()
    showDialog.value = false
  }

  function confirmDelete(index) {
    $q.dialog({
      title: '確認刪除',
      message: `是否刪除「${workLinks.value[index].title}」？`,
      cancel: true,
      persistent: true
    }).onOk(() => {
      workLinks.value.splice(index, 1)
      saveToStorage()
    })
  }

  const filteredLinks = computed(() => {
    let filtered = workLinks.value

    if (searchTerm.value.trim()) {
      const lowerSearch = searchTerm.value.trim().toLowerCase()
      filtered = filtered.filter(
        link =>
          link.title.toLowerCase().includes(lowerSearch) ||
          link.url.toLowerCase().includes(lowerSearch)
      )
    }

    if (selectedCategory.value) {
      filtered = filtered.filter(link => link.category === selectedCategory.value)
    }

    return filtered.map(link => ({
      link,
      originalIndex: workLinks.value.indexOf(link)
    }))
  })

  const categoriesWithAll = computed(() => {
    return [{ label: '全部', value: null }, ...categories.value.map(c => ({ label: c, value: c }))]
  })
</script>

<style>
  .text-bold {
    font-weight: 600;
  }
  .rounded-borders {
    border-radius: 12px;
  }
  .text-outline {
    text-shadow:
      -1px -1px 0 #a1c4fd,
      1px -1px 0 #a1c4fd,
      -1px 1px 0 #a1c4fd,
      1px 1px 0 #a1c4fd;
  }
</style>
