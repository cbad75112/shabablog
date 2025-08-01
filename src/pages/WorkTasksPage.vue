<template>
  <q-page class="q-pa-md">
    <!-- 標題與功能按鈕列 -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-info flex items-center">
        <q-icon name="assignment" size="md" class="q-mr-sm text-info" />
        工作代辦事項
      </div>
      <div class="row q-gutter-sm">
        <q-btn unelevated icon="add" label="新增任務" color="primary" @click="openTaskDialog()" />
        <q-btn
          unelevated
          icon="category"
          label="分類管理"
          color="secondary"
          @click="showCategoryDialog = true"
        />
      </div>
    </div>

    <!-- 搜尋與篩選 -->
    <q-card flat bordered class="q-mb-md shadow-2 rounded-borders">
      <q-card-section>
        <div class="row q-gutter-sm">
          <q-input
            filled
            dense
            v-model="search"
            placeholder="搜尋任務..."
            debounce="300"
            clearable
            class="col"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>

          <!-- 分類篩選 -->
          <q-select
            filled
            dense
            v-model="selectedCategory"
            :options="categories.map(c => ({ label: c, value: c }))"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            placeholder="分類"
            clearable
            class="col-2"
          />

          <!-- 狀態篩選 -->
          <q-select
            filled
            dense
            v-model="statusFilter"
            :options="statusOptions"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            placeholder="狀態"
            clearable
            class="col-2"
          />

          <!-- 排序方式 -->
          <q-select
            filled
            dense
            v-model="sortBy"
            :options="sortOptions"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            placeholder="排序"
            class="col-2"
          />
        </div>
      </q-card-section>
    </q-card>
    <!-- 任務列表 -->
    <div v-if="tasks.length > 0">
      <q-list bordered separator class="rounded-borders shadow-2">
        <q-expansion-item
          v-for="category in filteredCategories"
          :key="category"
          :label="category"
          icon="folder"
          expand-icon="expand_more"
          header-class="bg-info text-white"
          style="font-size: 20px"
        >
          <div v-if="filteredTasksByCategory(category).length > 0">
            <q-item
              v-for="task in filteredTasksByCategory(category)"
              :key="task.id"
              class="q-pa-sm task-item"
              clickable
              v-ripple
            >
              <q-item-section side>
                <q-checkbox
                  v-model="task.completed"
                  color="primary"
                  @update:model-value="saveTasks"
                />
              </q-item-section>

              <q-item-section>
                <q-item-label :class="task.completed ? 'text-strike text-grey-6' : 'text-body1'">
                  <q-icon
                    v-if="task.urgent"
                    name="priority_high"
                    color="negative"
                    size="sm"
                    class="q-mr-xs"
                  />
                  {{ task.title }}
                </q-item-label>
                <q-item-label caption class="text-grey-7">
                  {{ task.description }}
                </q-item-label>
                <q-item-label caption>
                  <q-icon name="event" size="sm" class="q-mr-xs text-primary" />
                  <span :class="isOverdue(task) ? 'text-negative' : ''">
                    {{ formatDate(task.dueDate) }}
                  </span>
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-btn
                  dense
                  flat
                  round
                  icon="edit"
                  color="primary"
                  @click.stop="openTaskDialog(task)"
                />
                <q-btn
                  dense
                  flat
                  round
                  icon="delete"
                  color="negative"
                  @click.stop="deleteTask(task.id)"
                />
              </q-item-section>
            </q-item>
          </div>
          <div v-else class="text-center q-pa-sm text-grey">無任務</div>
        </q-expansion-item>
      </q-list>
    </div>
    <div v-else class="text-center q-pa-lg text-grey">
      <q-icon name="inbox" size="lg" class="q-mb-sm" />
      尚未新增任何任務
    </div>

    <!-- 新增/編輯任務 Dialog -->
    <q-dialog v-model="showTaskDialog">
      <q-card style="min-width: 400px" class="rounded-borders shadow-4">
        <q-card-section>
          <div class="text-h6 text-primary">
            <q-icon name="edit_note" class="q-mr-sm" />
            {{ editingTask ? '編輯任務' : '新增任務' }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="taskForm.title" label="標題" filled dense autofocus />
          <q-input
            v-model="taskForm.description"
            label="描述"
            type="textarea"
            filled
            dense
            class="q-mt-sm"
          />
          <q-select
            v-model="taskForm.category"
            :options="categories"
            label="分類"
            filled
            dense
            class="q-mt-sm"
          />
          <q-input
            filled
            dense
            v-model="taskForm.dueDate"
            label="截止日期"
            mask="####-##-##"
            class="q-mt-sm"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="taskForm.dueDate" mask="YYYY-MM-DD" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-toggle v-model="taskForm.urgent" label="急件" color="negative" class="q-mt-sm" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="grey" v-close-popup />
          <q-btn unelevated label="儲存" color="primary" @click="saveTask" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 分類管理 Dialog -->
    <q-dialog v-model="showCategoryDialog">
      <q-card style="min-width: 350px" class="rounded-borders shadow-4">
        <q-card-section>
          <div class="text-h6 text-secondary">
            <q-icon name="category" class="q-mr-sm" />
            分類管理
          </div>
        </q-card-section>
        <q-card-section>
          <div v-for="(cat, index) in categories" :key="index" class="row items-center q-mb-sm">
            <q-input dense filled v-model="categories[index]" class="col" />
            <q-btn dense flat round icon="delete" color="negative" @click="deleteCategory(index)" />
          </div>
          <q-btn
            dense
            unelevated
            icon="add"
            label="新增分類"
            color="secondary"
            class="q-mt-sm"
            @click="categories.push('新分類')"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="關閉" color="grey" v-close-popup />
          <q-btn unelevated label="儲存" color="secondary" @click="saveCategories" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { uid, date } from 'quasar'
  import { useQuasar } from 'quasar'
const $q = useQuasar()

  const tasks = ref([])
  const categories = ref(['預設分類'])
  const showTaskDialog = ref(false)
  const showCategoryDialog = ref(false)
  const editingTask = ref(null)
  const taskForm = ref({
    title: '',
    description: '',
    urgent: false,
    completed: false,
    category: '預設分類',
    dueDate: null
  })
  const search = ref('')
  const selectedCategory = ref(null)
  const statusFilter = ref(null)

  const statusOptions = [
    { label: '未完成', value: false },
    { label: '已完成', value: true }
  ]

  const sortBy = ref('dueDate') // 預設用截止日期
  const sortOptions = [
    { label: '截止日期', value: 'dueDate' },
    { label: '標題', value: 'title' },
    { label: '急件優先', value: 'urgent' }
  ]

  // 讀取 localStorage
  onMounted(() => {
    const storedTasks = localStorage.getItem('workTasks')
    if (storedTasks) tasks.value = JSON.parse(storedTasks)

    const storedCategories = localStorage.getItem('workCategories')
    if (storedCategories) categories.value = JSON.parse(storedCategories)
  })

  // 儲存任務
  const saveTasks = () => {
    localStorage.setItem('workTasks', JSON.stringify(tasks.value))
  }

  // 儲存分類
  const saveCategories = () => {
    categories.value = categories.value.filter(c => c.trim() !== '')
    localStorage.setItem('workCategories', JSON.stringify(categories.value))
    showCategoryDialog.value = false
  }

  // 篩選分類
  const filteredCategories = computed(() => {
    if (selectedCategory.value) return [selectedCategory.value]
    return categories.value
  })

  // 篩選任務 + 排序
  const filteredTasksByCategory = category => {
    const filtered = tasks.value.filter(t => {
      return (
        t.category === category &&
        (!search.value || t.title.includes(search.value) || t.description.includes(search.value)) &&
        (statusFilter.value === null || t.completed === statusFilter.value)
      )
    })
    return sortTasks(filtered)
  }

  // 排序後的任務
  const sortTasks = taskList => {
    if (sortBy.value === 'dueDate') {
      return taskList.slice().sort((a, b) => {
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate) - new Date(b.dueDate)
      })
    } else if (sortBy.value === 'title') {
      return taskList.slice().sort((a, b) => a.title.localeCompare(b.title))
    } else if (sortBy.value === 'urgent') {
      return taskList.slice().sort((a, b) => (b.urgent === a.urgent ? 0 : b.urgent ? 1 : -1))
    }
    return taskList
  }

  // 開啟任務 Dialog
  const openTaskDialog = (task = null) => {
    if (task) {
      editingTask.value = task
      taskForm.value = { ...task }
    } else {
      editingTask.value = null
      taskForm.value = {
        title: '',
        description: '',
        urgent: false,
        completed: false,
        category: categories.value[0],
        dueDate: date.formatDate(new Date(), 'YYYY-MM-DD')
      }
    }
    showTaskDialog.value = true
  }

  // 儲存任務
  const saveTask = () => {
    if (!taskForm.value.title.trim()) return

    if (editingTask.value) {
      Object.assign(editingTask.value, taskForm.value)
    } else {
      tasks.value.push({ id: uid(), ...taskForm.value })
    }
    saveTasks()
    showTaskDialog.value = false
  }

// 刪除任務
const deleteTask = id => {
  const task = tasks.value.find(t => t.id === id)
  $q.dialog({
    title: '確認刪除',
    message: `確定要刪除任務「${task?.title || ''}」嗎？`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    tasks.value = tasks.value.filter(t => t.id !== id)
    saveTasks()
    $q.notify({ type: 'positive', message: '任務已刪除' })
  })
}
const deleteCategory = index => {
  const cat = categories.value[index]
  $q.dialog({
    title: '確認刪除分類',
    message: `確定要刪除分類「${cat}」嗎？\n此分類的任務將移動到「預設分類」。`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    tasks.value.forEach(t => {
      if (t.category === cat) t.category = '預設分類'
    })
    categories.value.splice(index, 1)
    saveCategories()
    $q.notify({ type: 'warning', message: `分類「${cat}」已刪除，相關任務移至預設分類` })
  })
}


  // 日期格式化
  const formatDate = d => {
    return d ? date.formatDate(d, 'YYYY/MM/DD') : '未設定'
  }

  // 判斷是否過期
  const isOverdue = task => {
    if (!task.dueDate || task.completed) return false
    return new Date(task.dueDate) < new Date()
  }
</script>

<style scoped>
  .text-strike {
    text-decoration: line-through;
  }
  .task-item:hover {
    background: rgba(239, 11, 11, 0.03);
    border-radius: 10px;
  }
</style>
