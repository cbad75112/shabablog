# Vue 元件生命週期

## 生命週期

每個 Vue 組件實例在創建時都會經歷一系列初始化步驟，例如設置數據觀察、編譯模板、將實例掛載到 DOM 並在數據更改時更新 DOM。在過程中，元件會運行稱為生命週期鉤子 (lifecycle hooks) 的函數，使開發者能夠在特定階段添加自己的程式碼。

實際上最常用到的是 setup、onMounted、onUnMounted

---

## 生命週期鉤子

# 觀察者設計模式

Vue3 的生命週期鉤子（lifecycle hooks）實際上也是觀察者設計模式的一種實現。在這種模式中，一個目標對象管理所有依賴於它的觀察者對象，並在其本身的狀態改變時主動通知它們。

# onMounted

在 Vue3 中，當組件的某個生命週期階段到達時（例如，組件被掛載到 DOM、更新或卸載等），相應的生命週期鉤子就會被調用。
當我們在 Vue3 中調用 onMounted 生命週期鉤子時，Vue 會自動將我們提供給 onMounted 的回調函數與當前正在活動的組件實例進行關聯。這意味當組件被掛載時，我們的回呼函數將被執行。

```javascript
<script setup>
  import {onMounted} from 'vue' onMounted(() => {console.log(`元件已掛載`)});
</script>
```

## Summary

組件到達某個生命週期階段，相應的生命週期鉤子就會被調用。
生命週期鉤子是觀察者設計模式的一種實現。
setup 是組件實體產生前的準備階段，在組件建立前被調用。
onMounted 是組件被掛載到 DOM 的生命週期鉤子。
onUnMounted 是組件從 DOM 卸載的生命週期鉤子，常用於解除事件監聽和 watcher。
