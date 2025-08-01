<template>
  <q-page class="q-pa-md flex column items-center">
    <div class="text-h5 q-mb-md text-center">💻 程式碼格式化工具</div>

    <q-card class="formatter-card q-pa-md full-width" flat bordered>
      <div class="row q-col-gutter-md items-center">
        <div class="col-12 col-md-4">
          <q-select
            v-model="selectedLanguage"
            :options="['javascript', 'typescript', 'html', 'css', 'scss', 'markdown', 'json']"
            label="選擇語言"
            outlined
            dense
            class="q-mb-md"
          />
        </div>

        <div class="col-12 col-md-8 text-right">
          <q-btn
            color="secondary"
            icon="content_copy"
            @click="copyFormattedCode"
            style="margin-right: 10px"
          />

          <q-btn color="primary" icon="format_align_left" label="格式化" @click="formatCode" />
        </div>
      </div>

      <div class="row q-col-gutter-md q-mt-md">
        <div class="col-12">
          <vue-monaco-editor
            v-model:value="code"
            :language="selectedLanguage"
            theme="vs-dark"
            :options="editorOptions"
            height="600px"
            @mount="handleEditorMount"
          />
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
  import { ref, shallowRef, watch } from 'vue'
  import { useQuasar } from 'quasar'

  const $q = useQuasar()
  const selectedLanguage = ref('javascript')
  const code = ref('// 請輸入您的程式碼')
  const editorInstance = shallowRef(null)
  const monacoInstance = shallowRef(null)

  const editorOptions = {
    automaticLayout: true,
    formatOnType: true,
    formatOnPaste: true
  }

  const handleEditorMount = (editor, monaco) => {
    editorInstance.value = editor
    monacoInstance.value = monaco
    monaco.editor.setTheme($q.dark.isActive ? 'vs-dark' : 'vs')
  }

  // 監聽暗模式狀態變化，並更新 Monaco Editor 的主題
  watch(
    () => $q.dark.isActive,
    isDark => {
      if (monacoInstance.value) {
        monacoInstance.value.editor.setTheme(isDark ? 'vs-dark' : 'vs')
      }
    }
  )

  const formatCode = () => {
    if (editorInstance.value) {
      editorInstance.value.getAction('editor.action.formatDocument').run()
    }
  }

  const copyFormattedCode = async () => {
    try {
      await navigator.clipboard.writeText(code.value)
      $q.notify({ type: 'positive', message: '已複製到剪貼簿' })
    } catch (err) {
      $q.notify({ type: 'negative', message: '複製失敗' + err })
    }
  }
</script>

<style scoped>
  .formatter-card {
    max-width: 2000px;
    min-height: 700px;
    width: 100%;
  }

  body.body--light .formatter-card {
    background-color: #ffffff;
    border: 1px solid #ccc;
  }

  body.body--dark .formatter-card {
    background-color: #1e1e1e;
    border: 1px solid #444;
  }
</style>
