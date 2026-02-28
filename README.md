# 📊 AI Server Cooling TCO Dashboard & Sales Enablement Tool
> 作者： 莊仕祺 (Bryan Jhuang) | 目標領域： AI Server Product Planning / NPI Management

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)
![Vanilla JS](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![MVC Architecture](https://img.shields.io/badge/Architecture-MVC_Modular-blue)

🔗 Live Demo (線上預覽): [點擊這裡體驗互動式儀表板](https://bryan47nice.github.io/ai_server_pm47/)

---

## 💡 產品背景與價值主張 (Value Proposition)
在 AI 伺服器的高密度算力時代（如 NVIDIA GB200 叢集），客戶面臨從「傳統氣冷 (Air Cooling)」轉型至「直接液冷 (Direct Liquid Cooling, DLC)」的巨大決策成本。

本專案為一款專為 B2B 伺服器代工廠 (ODM) 產品企劃與前端業務打造的 **「BI 商業智慧級決策與銷售賦能系統」**。不僅提供精準的 TCO (總擁有成本) 試算，更具備 **多情境方案比較**、**AI 跨方案決策報告** 與 **沉浸式互動導覽 (Onboarding)** 功能。協助業務以數據為基底，具象化硬體架構轉換的長期財務 ROI，展現「幫客戶做決策，而不只是給數據」的高階商業價值。
（專案內附「軟硬體 Product Planning 思維對照表」，展現軟體敏捷思維如何無縫接軌硬體 NPI 流程。）

---

## ✨ 核心功能模組 (Core Features)

### 📈 Module A: 參數連動與精算儀表板 (TCO Engine)
* **雙向綁定與即時試算：** 「單機櫃伺服器數量」支援滑桿與精確輸入雙向連動，即時換算機櫃總數與單櫃功耗。
* **真實營運還原 (Utilization Rate)：** 導入「伺服器稼動率」參數，破除 100% 滿載的理想假設，讓耗電量估算更貼近資料中心真實狀況。
* **智慧推薦與公式透明化：** 依據單櫃功耗動態給予散熱方案建議，並展示 OpEx 運算白盒公式，建立客戶信任感。

### 🔍 Module B: 互動式下鑽分析 (Precision Drill-down UI)
* **高精度財務捕捉：** 實作資料層 (Data Layer) 攔截，即使黃金交叉點落於非整數年 (如 3.4 年)，亦能動態注入圖表節點。
* **年度成本拆解與橫向對比：** 點擊圖表節點即可彈出拆解面板，左右並列氣冷與液冷的 CapEx 與 OpEx 累計明細。
* **動態勝敗判定：** 自動結算該年度的「勝出方案」與「節省總額」，並為浮點數交叉點觸發專屬的「⚖️ 成本平手」決策視圖。

### 📊 Module C: BI 商業智慧多情境比較 (Scenario Comparison)
* **記憶體狀態機快照：** 支援同時建立最多 4 組硬體配置情境，系統自動快照並保存各情境的參數與獨立快取，切換時零延遲 (Zero-latency)。
* **雙軌並排渲染引擎：** 進入比較模式後，動態實例化多組獨立的 Chart.js 折線圖，提供並排對照最佳方案、回本年份與總省下金額的高階視覺化面板。
* **跨方案決策報告 (Executive Summary)：** 系統自動掃描所有平行情境，找出「最優解」與「最差解」進行對決，並自動生成帶有具體財務差額與戰略推薦的高階論述。

### 🪄 Module D: 業務賦能與極致防呆 (Sales Enablement & UX)
* **動態教戰報告生成：** 依據當下計算結果，一鍵產出對應的「核心說帖 (Elevator Pitch)」、「反對意見克服」與「ESG 減碳亮點」。
* **過期狀態攔截 (Dirty State Invalidation)：** 深度比對參數雜湊值，當參數變更時，自動觸發 Overlay 遮罩覆蓋過期報告，確保業務拿到的數據 100% 準確。
* **URL 狀態序列化分享：** 將複雜的運算參數序列化至網址列，業務可一鍵複製專屬短網址分享給客戶，點擊即還原完整設定。

### 💬 Module E: 沉浸式首次體驗 (Product-Led Onboarding)
* **防彈級互動導覽 (Bulletproof Guided Tour)：** 針對首次造訪的面試官或使用者，實裝零相依 (Zero-dependency) 的純原生 JS 導覽引擎。
* **無縫轉場與精準攔截：** 實作 `opacity` 隱身瞬移與動態 DOM 座標追蹤，提供如幻燈片般的流暢指引。具備嚴格的情境觸發機制（僅於電腦版及 TCO 頁籤啟動），並結合 `localStorage` 避免打擾閱讀心流。

### 📸 Module F: 企業級輸出與防禦渲染引擎 (Advanced Export Engine)
* **鐵壁 A4 PDF 匯出：** 針對 `@media print` 進行底層 CSS 區塊流 (Block Flow) 重構，廢棄彈性佈局，精準鎖定各層高度與絕對定位頁尾，徹底解決列印重疊與斷頁問題。
* **一鍵高畫質 PNG 截圖：** 針對特定 DOM 區塊實裝前端渲染快門。克服 `html2canvas` 痛點，實裝「強制捲動歸零 (Scroll Reset)」，並採用「臨時 DOM 包裝策略」動態注入四周留白，確保產出完美置中且不切邊的簡報級圖卡。
* **智慧防呆攔截彈窗：** 若使用者在「決策報告未生成」時試圖截圖，系統將手動彈出精美的 Tailwind 提示視窗，建議「產出報告並匯出」，大幅提升 AI 總結功能的使用率。

### 🌐 Module G: 國際化與純淨架構 (i18n & Clean Architecture)
* **i18n 中英雙語徹底解耦：** 全站支援即時中英切換（含圖表標籤、Tooltip、導覽氣泡與防呆提示）。清償硬編碼技術債，將所有字串抽離至獨立的 `i18n_dict.js` 字典檔中。
* **零 Token 快取機制：** 語系切換直接命中本地 JavaScript 物件，即使在導覽途中切換，亦能瞬間重繪文字，達成零 API 延遲與零成本消耗的極致體驗。

---

## 🏗️ 系統架構與模組化設計 (System Architecture)

為確保專案具備高度擴展性，本系統揚棄單一檔案開發，全面採用 MVC (Model-View-Controller) 解耦架構，展現軟體工程維護視角：

* 📄 `index.html` (View): 專注於 UI 佈局、Tailwind 樣式管理、CSS 動畫與雙軌視圖 (單一/比較模式) 切換狀態呈現。
* ⚙️ `tco_engine.js` (Controller & Logic): 核心運算大腦。封裝硬體功耗換算、Chart.js 多實體渲染、情境記憶體陣列 (`scenarios`) 管理、導覽狀態機 (`TourEngine`) 以及 PDF/PNG 複雜的非同步匯出與 DOM 攔截邏輯。
* 🌐 `i18n_dict.js` (Data - L10n): 獨立語系資料字典。集中管理全域中英文字串，未來擴充第三語言無需更動核心代碼。
* 🧠 `cooling_kb.js` (Data - RAG Mock): 獨立技術知識庫。存放散熱 Domain Knowledge，模擬 AI 檢索資料源。

---

## 📐 系統運算邏輯與假設 (Business Constraints)

1. **散熱臨界值判定 (Cooling Thresholds)**
* `< 40 kW/Rack:` 🟢 傳統氣冷 (Air Cooling)
* `40 - 80 kW/Rack:` 🟡 氣冷極限 (RDHX)
* `> 80 kW/Rack:` 🔴 強制液冷 (Must use DLC)

2. **為什麼單機櫃上限設定為 72 節點？**
對標 NVIDIA GB200 NVL72 參考架構之三大物理極限：
* **空間極限 (U-space):** 機櫃需容納運算匣、Switch 與水冷 Manifold，已達飽和。
* **訊號極限 (Signal Integrity):** GPU 間透過銅線傳輸，72 節點之高度為 NVLink 訊號不衰減之極限。
* **供電極限 (Power Limit):** 單櫃總功耗達 100-120kW，觸及多數先進機房供電天花板。

---

## 🚀 未來優化發展 (Hardware PM Roadmap)

作為一個持續迭代的決策產品，下一階段的 Roadmap 將專注於硬體 NPI 痛點與供應鏈現實：

1. **🥇 Priority 1: 供應鏈交期與風險預警模組 (Supply Chain & Lead Time Impact)**
   * **痛點：** 液冷關鍵零組件（如 CDU、快接頭）交期極長，易成為 NPI 時程瓶頸。
   * **規劃：** 導入「預估上線時間 (Target MP Date)」參數，根據選擇的散熱架構動態亮起交期風險紅綠燈，提醒業務與客戶提早備料 (Pre-build)，展現對專案時程 (Schedule) 的敏銳度。
2. **🥈 Priority 2: 跨晶片架構戰略分析 (Multi-Vendor Architecture Matrix)**
   * **痛點：** 客戶在 NVIDIA 之外，亦會評估 AMD MI300X、Intel Gaudi 甚至雲端自研 ASIC 帶來的 TCO 差異。
   * **規劃：** 擴充晶片型號資料庫，加入「算力性價比 (TFLOPS per Dollar)」對照矩陣。不僅比散熱，更協助客戶在絕對效能與初始 CapEx 間做出最符合應用場景的 Trade-off。
3. **🥉 Priority 3: 基礎設施就緒度自評 (Data Center Readiness Assessment)**
   * **痛點：** 設備送達機房才發現樓板承重不足或無盲孔地板，導致 Go-To-Market 卡關。
   * **規劃：** 當系統推薦 DLC 液冷方案時，動態生成「機房落地 Checklist」（如：樓板承重 >1500kg/m²、具備一次側冰水管路等），將硬體產品的物理限制 (Physical Constraints) 納入前端決策防呆流程。
