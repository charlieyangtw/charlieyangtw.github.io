```markdown
# 🚀 輕量級無後端專案管理與接案履歷系統 (Headless CMS)

本專案是一個兼具**高隱密性**、**極簡架構**與**動態渲染**的單頁應用程式 (SPA) 履歷與專案管理系統。
全站完全採用 **Cloudflare Worker 後端微服務** 作為核心資料代理層，擺脫傳統伺服器與資料庫的束縛，利用免費且強大的雲端生態系（GitHub Pages + Google Sheets + Cloudflare Workers），打造出兼顧安全性、零維護成本與極致效能的現代化網頁。

---

## 💡 核心設計構思 (Architecture & Design)

在一般個人網站、靜態履歷或小型專案展示的場景中，架設傳統的「後端伺服器 + 資料庫」往往面臨**開發成本高、每月固定主機支出、維護資安漏洞（如 SQL Injection）**等痛點。

本專案經過多次架構迭代，最終演進為以 **Serverless API Proxy** 為核心的無後端架構：
1. **資料管理平民化**：使用 **Google 試算表** 作為資料庫（CMS 主控台）。非技術人員也能像操作 Excel 一樣，即時新增、刪除或調整排序列表資料，免去手寫 HTML 的麻煩。
2. **前後端徹底分離 (SPA)**：`index.html` 僅作為極簡的網頁掛載點，所有 UI 渲染骨架、路由控制與 Fetch API 資料請求邏輯全部抽離至獨立的 `app.js` 模組中，大幅提升代碼的可維護性與載入速度。
3. **100% 的源頭保密與跨網域防護**：捨棄前端直連 Google Sheets 的傳統做法（此作法容易在 F12 網路頁籤洩漏後台網址）。全面引入 **Cloudflare Worker** 作為安全反向代理層 (Reverse Proxy)，將真實資料庫來源安全鎖在雲端，並實施嚴格的網域鎖定（CORS 限制），有效防止數據遭他人惡意盜用。

---

## 🛠️ 採用的關鍵技術 (Technical Stack)

### 1. 前端 UI 與 渲染 (HTML5 / Tailwind CSS)
* **極簡掛載點**：HTML 檔案僅保留 `<head>` 的函式庫載入與 `<body>` 的單一 `<div id="app">` 元件。
* **Tailwind CSS v4**：全站無額外手寫 CSS，純使用 Tailwind 實作精美的卡片網格佈局 (`grid`)、膠囊標籤化呈現 (`flex-wrap`)、與響應式視窗縮放。
* **Flexbox 佈局陷阱優化**：利用網頁鎖死 `h-screen`、中間大容器與內嵌 HTML 容器加上 `min-h-0`、`overflow-y-auto` 的完美組合，**徹底解決長內容撐破容器導致頁尾 (Footer) 程式與資料版本號消失的經典 Bug**，滾動條被精準限制在右側內容區。

### 2. 資料處理與核心邏輯 (JavaScript ES6+ / PapaParse)
* **異步資料流 (Async/Await Fetch)**：利用原生 Fetch API 連線至自建的 Cloudflare Worker 後端端點獲取即時資料。
* **標準 CSV 串流解析 (PapaParse)**：採用 PapaParse 解析器自動清洗試算表資料。智慧應對儲存格內按 Enter 換行的「換行大魔王」邊界問題。
* **多功能資料分流與動態注入**：
  * **功能 = 0**：系統控制層。自動建立字典表（Map），動態注入站台標題（`Title`）、程式版本（`AppVersion`）與資料版本（`DataVersion`）至對應元件。
  * **功能 = 1**：內容展示層。自動過濾並啟動強制數值轉換排序（`Number(a['排序']) - Number(b['排序'])`），確保數學邏輯正確（防範字串排序如 `10, 100, 2` 的災難），並動態渲染左側列表。

---

## 🔒 核心防護機制：Cloudflare Worker 反向代理

本專案全面淘汰了前端直連或前端 Base64 解碼等初階混淆方案，改用企業級的 **Serverless 反向代理** 技術。

**反向代理運作機制：**
### 📋 Cloudflare Worker 完整源碼參考 (防呆與 CORS 強化版)

🌐 參考與整合網站生態系
本專案與以下全球領先的免費雲端服務完成無縫鏈結：

GitHub Pages (https://pages.github.com/)：提供專案前端靜態網頁（index.html、app.js）零成本、全球 CDN 加速的網頁代管服務。

Google 試算表 (https://www.google.com/sheets/about/)：充當雲端 Headless CMS。利用其「發布到網路」功能匯出成標準 CSV 格式作為系統輕量資料庫。

Cloudflare Workers(https://workers.cloudflare.com/)：提供每日高達 10 萬次免費額度的 Serverless 邊緣運算平台。負責在最接近使用者的節點執行安全反向代理、CORS 標頭阻擋與異常攔截，完成整套架構的安全閉環。