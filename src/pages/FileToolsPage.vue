<template>
  <q-page padding class="converter-page">
    <!-- 圖片轉檔與大小調整 -->
    <q-card
      class="section-card image-convert q-mb-lg"
      :class="{ 'dark-card': $q.dark.isActive, 'light-card': !$q.dark.isActive }"
    >
      <q-card-section>
        <div class="section-header">
          <q-icon name="photo" size="24px" class="q-mr-sm" />
          <h5 class="section-title">圖片轉檔與大小調整</h5>
        </div>
        <div class="row q-gutter-sm items-center">
          <q-file
            v-model="imgFile"
            label="選擇圖片檔"
            accept="image/*"
            @update:model-value="handleImageFile"
            filled
            class="my-file flex-1"
          />
          <q-btn
            icon="autorenew"
            @click="convertImage"
            color="primary"
            dense
            round
            aria-label="轉換圖片"
          />
        </div>

        <div class="row q-col-gutter-md q-mt-sm items-center">
          <q-input
            v-model.number="resizeWidth"
            type="number"
            label="寬度 (px)"
            dense
            class="dim-input"
            @update:model-value="onWidthInput"
          />
          <q-input
            v-model.number="resizeHeight"
            type="number"
            label="高度 (px)"
            dense
            class="dim-input"
            @update:model-value="onHeightInput"
          />
          <q-checkbox v-model="keepRatio" label="保持比例" dense />
          <q-select
            v-model="imageFormat"
            :options="imageFormatOptions"
            label="輸出格式"
            dense
            class="format-select"
          />
        </div>

        <div v-if="convertedImageDataUrl" class="q-mt-md">
          <h6 class="preview-title">轉換結果預覽</h6>
          <img
            :src="convertedImageDataUrl"
            alt="converted"
            class="converted-image-preview q-mb-sm"
          />
          <q-btn
            icon="download"
            @click="downloadImage"
            color="secondary"
            dense
            round
            aria-label="下載圖片"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- XPS 或 PDF 轉 Base64 -->
    <q-card
      class="section-card doc-base64 q-mb-lg"
      :class="{ 'dark-card-red': $q.dark.isActive, 'light-card': !$q.dark.isActive }"
    >
      <q-card-section>
        <div class="section-header">
          <q-icon name="description" size="24px" class="q-mr-sm" />
          <h5 class="section-title">XPS 或 PDF 轉 Base64</h5>
        </div>
        <div class="row q-gutter-sm items-center">
          <q-file
            v-model="docFile"
            label="選擇 XPS 或 PDF 檔"
            accept=".pdf,.xps,application/pdf,application/vnd.ms-xpsdocument"
            @update:model-value="handleDocFile"
            filled
            class="my-file"
            style="min-width: 500px"
          />
          <q-btn
            icon="content_copy"
            color="primary"
            @click="copyDocBase64"
            unelevated
            rounded
            dense
            aria-label="複製 Base64"
          />
          <q-btn
            icon="clear"
            color="warning"
            @click="clearPdfTo64"
            dense
            rounded
            aria-label="清除"
          />
        </div>

        <div v-if="showBase64" class="q-mt-sm">
          <q-input
            type="textarea"
            label="Base64 內容"
            v-model="docBase64"
            class="base64-textarea fixed-height"
            readonly
            dense
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Base64 轉 PDF/XPS 下載 -->
    <q-card
      class="section-card base64-download"
      :class="{ 'dark-card-pink': $q.dark.isActive, 'light-card': !$q.dark.isActive }"
    >
      <q-card-section>
        <div class="section-header">
          <q-icon name="cloud_download" size="24px" class="q-mr-sm" />
          <h5 class="section-title">Base64 轉 PDF/XPS 下載</h5>
        </div>
        <q-input
          type="textarea"
          label="請貼上 Base64 內容"
          v-model="inputBase64"
          class="base64-textarea fixed-height q-mb-sm"
          dense
        />

        <div class="row q-gutter-sm items-center">
          <q-select
            v-model="base64OutputFormat"
            :options="base64OutputFormatOptions"
            label="選擇下載格式"
            dense
            style="min-width: 250px"
          />
          <q-btn
            icon="download"
            v-if="test"
            @click="downloadFromBase64Input"
            color="primary"
            :disable="!inputBase64"
            dense
            round
            aria-label="下載檔案"
          />
          <q-btn
            icon="content_paste"
            @click="pasteFromClipboard"
            flat
            round
            dense
            aria-label="貼上剪貼簿"
          />
          <q-btn
            icon="visibility"
            @click="previewPdfFromBase64"
            color="secondary"
            dense
            round
            aria-label="預覽 PDF"
          />
          <q-btn
            icon="clear"
            color="warning"
            @click="clearPreviewAndInput"
            dense
            round
            aria-label="清除預覽"
          />
        </div>

        <div v-if="previewPdfUrl" class="q-mt-md">
          <h6 class="preview-title">PDF 預覽</h6>
          <iframe :src="previewPdfUrl" width="100%" height="500px" class="pdf-preview-frame" />
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
  import { ref } from 'vue'
  import { useQuasar } from 'quasar'

  const $q = useQuasar()
  const test = ref(false)
  // ========== 圖片轉檔與大小調整 ==========
  const imgFile = ref(null)
  const resizeWidth = ref(null)
  const resizeHeight = ref(null)
  const keepRatio = ref(true) // 是否保持比例，預設 true
  const imageFormat = ref('png')
  const imageFormatOptions = [
    { label: 'PNG', value: 'png' },
    { label: 'JPEG', value: 'jpeg' },
    { label: 'WEBP', value: 'webp' }
  ]
  const convertedImageDataUrl = ref(null)

  // 儲存原圖尺寸
  let originalWidth = 0
  let originalHeight = 0

  function handleImageFile(newFile) {
    convertedImageDataUrl.value = null

    // 這裡使用傳入參數 newFile，確保拿到正確的檔案
    if (!newFile) {
      resizeWidth.value = null
      resizeHeight.value = null
      originalWidth = 0
      originalHeight = 0
      return
    }
    const file = newFile
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        originalWidth = img.width
        originalHeight = img.height
        resizeWidth.value = originalWidth
        resizeHeight.value = originalHeight
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  }

  let isAdjustingWidth = false
  let isAdjustingHeight = false

  function onWidthInput(val) {
    // val 是最新的寬度
    if (!keepRatio.value) return
    if (isAdjustingHeight) return
    if (!val || originalWidth === 0) return

    isAdjustingWidth = true
    resizeHeight.value = Math.round((val * originalHeight) / originalWidth)
    isAdjustingWidth = false
  }

  function onHeightInput(val) {
    // val 是最新的高度
    if (!keepRatio.value) return
    if (isAdjustingWidth) return
    if (!val || originalHeight === 0) return

    isAdjustingHeight = true
    resizeWidth.value = Math.round((val * originalWidth) / originalHeight)
    isAdjustingHeight = false
  }

  function convertImage() {
    if (!imgFile.value) {
      $q.notify({ type: 'negative', message: '請先選擇圖片檔！' })
      return
    }
    const file = imgFile.value
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = resizeWidth.value || img.width
        canvas.height = resizeHeight.value || img.height

        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        const format = imageFormat.value
        const quality = format === 'jpeg' || format === 'webp' ? 0.92 : undefined

        convertedImageDataUrl.value = canvas.toDataURL(`image/${format}`, quality)
        $q.notify({ type: 'positive', message: '圖片轉換完成' })
      }
      img.onerror = () => {
        $q.notify({ type: 'negative', message: '圖片載入失敗' })
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  }

  function downloadImage() {
    if (!convertedImageDataUrl.value) return
    const ext = typeof imageFormat.value === 'string' ? imageFormat.value : imageFormat.value?.value
    const link = document.createElement('a')
    link.href = convertedImageDataUrl.value
    link.download = `converted_image.${ext}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // ========== XPS 或 PDF 轉 Base64 ==========
  const docFile = ref(null)
  const docBase64 = ref(null)
  const showBase64 = ref(false)

  function handleDocFile() {
    docBase64.value = null
    showBase64.value = false

    if (!docFile.value) return

    const file = docFile.value
    const filename = file.name.toLowerCase()

    // 允許 PDF 或 XPS (用副檔名判斷，因為 file.type 可能不可靠)
    if (!filename.endsWith('.pdf') && !filename.endsWith('.xps')) {
      $q.notify({ type: 'negative', message: '請選擇 PDF 或 XPS 檔案' })
      return
    }

    const reader = new FileReader()

    reader.onload = e => {
      const arrayBuffer = e.target.result
      // 將 ArrayBuffer 轉成 Base64 字串
      const uint8Array = new Uint8Array(arrayBuffer)
      let binary = ''
      for (let i = 0; i < uint8Array.byteLength; i++) {
        binary += String.fromCharCode(uint8Array[i])
      }
      const base64Str = btoa(binary)

      docBase64.value = base64Str
      showBase64.value = true
      $q.notify({ type: 'positive', message: '已成功轉為 Base64' })
    }

    reader.onerror = () => {
      $q.notify({ type: 'negative', message: '讀取檔案發生錯誤' })
    }

    reader.readAsArrayBuffer(file)
  }

  // ========== Base64 轉 PDF/XPS 下載 ==========
  const base64OutputFormat = ref('pdf')
  const base64OutputFormatOptions = [
    { label: 'PDF', value: 'pdf' },
    { label: 'XPS', value: 'xps' }
  ]

  const inputBase64 = ref('')

  function downloadFromBase64Input() {
    if (!inputBase64.value) {
      $q.notify({ type: 'negative', message: '請先貼上 Base64 內容' })
      return
    }

    try {
      const byteCharacters = atob(inputBase64.value)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)

      let mimeType = 'application/pdf'
      let fileExt = 'pdf'
      if (base64OutputFormat.value === 'xps') {
        mimeType = 'application/vnd.ms-xpsdocument'
        fileExt = 'xps'
      }

      const blob = new Blob([byteArray], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `converted_file.${fileExt}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      $q.notify({ type: 'positive', message: '下載完成' })
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Base64 轉檔失敗！' + error.message
      })
    }
  }

  function copyDocBase64() {
    if (!docBase64.value) {
      $q.notify({ type: 'warning', message: '沒有 Base64 內容可複製' })
      return
    }
    navigator.clipboard
      .writeText(docBase64.value)
      .then(() => {
        $q.notify({ type: 'positive', message: 'Base64 已複製到剪貼簿' })
      })
      .catch(() => {
        $q.notify({ type: 'negative', message: '複製失敗，請手動複製' })
      })
  }
  function pasteFromClipboard() {
    navigator.clipboard
      .readText()
      .then(text => {
        inputBase64.value = text
        $q.notify({ type: 'info', message: '已貼上剪貼簿內容' })
      })
      .catch(() => {
        $q.notify({ type: 'negative', message: '無法貼上剪貼簿內容' })
      })
  }

  const previewPdfUrl = ref(null)

  function previewPdfFromBase64() {
    try {
      const byteCharacters = atob(inputBase64.value)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'application/pdf' })
      const blobUrl = URL.createObjectURL(blob)

      previewPdfUrl.value = blobUrl
      $q.notify({ type: 'positive', message: 'PDF 預覽已更新' })
    } catch (error) {
      $q.notify({ type: 'negative', message: '無法預覽 PDF：' + error.message })
    }
  }
  function clearPreviewAndInput() {
    if (previewPdfUrl.value) {
      URL.revokeObjectURL(previewPdfUrl.value)
    }
    previewPdfUrl.value = null
    inputBase64.value = ''
  }

  function clearPdfTo64() {
    docBase64.value = ''
    docFile.value = null
  }
</script>

<style scoped>
  /* .converter-page {
    font-family: 'Noto Sans TC', sans-serif;
  } */

  .section-card {
    border-radius: 18px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s ease;
  }

  .dark-card {
    background-color: #0e1a32;
  }

  .dark-card-red {
    background-color: #3c0101;
  }

  .dark-card-pink {
    background-color: #471329;
  }

  .light-card {
    background-color: #f0f2f5;
  }

  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
  }

  .section-title {
    font-size: 1.2rem;
    font-weight: bold;
    color: #777272;
  }

  .preview-title {
    font-weight: bold;
    margin-bottom: 8px;
  }

  .converted-image-preview {
    max-width: 100%;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .base64-textarea {
    width: 100%;
  }

  .fixed-height {
    min-height: 180px;
  }

  .dim-input {
    max-width: 150px;
  }

  .format-select {
    max-width: 150px;
  }
</style>
