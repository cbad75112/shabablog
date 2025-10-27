# 當 Quasar 修改路徑編譯後沒有畫面的問題
> 分類：Quasar  
> 參考來源：[Vuetify Dev Config 文件](https://vuetify3.tigernaxo.com/workshop/vuetify/devconfig.html)

---

當我們在 **Quasar/Vue 專案**中修改 `publicPath` 或使用 **History 模式的路由**（例如 `/blog`、`/resume` 等子路徑）時，  
若部署到 IIS 或部分靜態伺服器後，重新整理或直接訪問子路徑，常會出現：

> ❌ 找不到頁面（404）或畫面全白。

這是因為伺服器在沒有對應實體檔案時，沒有把請求導回前端的 `index.html` 處理。

---

## ✅ 解法 — 在 IIS 環境下設定 `web.config`

在專案的 `dist/spa` 目錄（也就是部署資料夾）中新增一個 **`web.config`**  
內容如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="Handle History Mode and custom 404/500" stopProcessing="true">
          <match url="(.*)" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="index.html" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
