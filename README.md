# 📊 AI Server Cooling TCO Dashboard & Sales Enablement Tool
> **作者：** 莊仕祺 (Bryan Jhuang) | **目標領域：** AI Server Product Planning / NPI Management

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)
![Vanilla JS](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![MVC Architecture](https://img.shields.io/badge/Architecture-MVC_Modular-blue)

🔗 **Live Demo (線上預覽):** [點擊這裡體驗互動式儀表板](https://bryan47nice.github.io/ai_server_pm47/)

---

## 💡 產品背景與價值主張 (Value Proposition)
在 AI 伺服器的高密度算力時代（如 NVIDIA GB200 叢集），客戶面臨從「傳統氣冷 (Air Cooling)」轉型至「直接液冷 (Direct Liquid Cooling, DLC)」的巨大決策成本。

本專案為一款專為 B2B 伺服器代工廠 (ODM) 產品企劃與前端業務打造的 **「動態商業決策與銷售賦能 (Sales Enablement) 系統」**。不僅提供精準的 TCO (總擁有成本) 試算，更導入了 **AI 業務教戰生成** 與 **算式下鑽分析** 功能。協助業務以數據為基底，具象化硬體架構轉換的長期財務 ROI。
（專案內附「軟硬體 Product Planning 思維對照表」，展現軟體敏捷思維如何無縫接軌硬體 NPI 流程。）

---

## ✨ 核心功能模組 (Core Features)

### 📈 Module A: 參數連動與精算儀表板 (TCO Engine)
* **雙向綁定與即時試算：** 「單機櫃伺服器數量」支援滑桿與精確輸入雙向連動，即時換算機櫃總數與單櫃功耗。
* **真實營運還原 (Utilization Rate)：** 導入「伺服器稼動率」參數，破除 100% 滿載的理想假設，讓耗電量估算更貼近資料中心真實狀況。
* **智慧推薦與公式透明化：** 依據單櫃功耗動態給予散熱方案建議，並展示 OpEx 運算白盒公式，建立客戶信任感。

### 🔍 Module B: 互動式下鑽分析 (Drill-down UI)
* **年度成本拆解：** 點擊 Chart.js 折線圖上的任意年份節點，即彈出「年度算式拆解面板」。
* **雙欄橫向對比：** 左右並列該年度氣冷與液冷的 CapEx (建置) 與 OpEx (營運) 累計明細，並自動結算該年度的「勝出方案」與「節省總額」。

### 🪄 Module C: 業務賦能與狀態機管理 (Sales Enablement)
* **動態教戰報告生成：** 依據當下 TCO 計算結果，一鍵產出對應的「核心說帖 (Elevator Pitch)」、「反對意見克服」與「財務 ROI 亮點」。
* **防呆覆蓋機制 (Dirty State)：** 當報告產出後，若使用者再次修改硬體參數，系統會自動利用 Overlay 覆蓋過期報告，提醒「參數已變更」，確保業務拿到手的數據 100% 準確。
* **FinOps 成本優化 (Cache 機制)：** 實作參數綁定之多語系快取池 (Cache Pool)。在參數不變的前提下切換語系，系統會自動命中快取 (Cache Hit)，達到 0 Token 額外消耗與瞬間渲染，展現嚴謹的 SaaS 產品營運思維。

### 🌐 Module D: 企業級 UI/UX 體驗
* **i18n 中英雙語解耦：** 全站支援即時中英切換（含圖表標籤與 Tooltip）。
* **列印最佳化 (@media print)：** 針對 A4 報告輸出客製化 CSS，自動隱藏操作按鈕，確保 PDF 匯出清晰不破版。
* **Domain Knowledge 提示：** 於關鍵參數旁加入 Hover Tooltip，解釋硬體物理極限 (如 72 節點的空間/訊號/供電限制)。

---

## 🏗️ 系統架構與模組化設計 (System Architecture)

為確保專案具備高度擴展性，本系統揚棄單一檔案開發，全面採用 **MVC (Model-View-Controller) 解耦架構**，展現軟體工程維護視角：

* 📄 **`index.html` (View):** 專注於 UI 佈局、Tailwind 樣式管理、CSS 動畫與 Tab 切換狀態呈現。
* ⚙️ **`tco_engine.js` (Controller & Logic):** 核心運算大腦。封裝硬體功耗換算、Chart.js 渲染與業務報告的狀態機攔截機制。
* 🌐 **`i18n_dict.js` (Data - L10n):** 獨立語系資料字典。未來擴充第三語言無需更動核心代碼。
* 🧠 **`cooling_kb.js` (Data - RAG Mock):** 獨立技術知識庫。存放散熱 Domain Knowledge，模擬 AI 檢索資料源。

---

## 📐 系統運算邏輯與假設 (Business Constraints)

**1. 散熱臨界值判定 (Cooling Thresholds)**
* `< 30 kW/Rack:` 🟢 推薦氣冷方案
* `30 - 50 kW/Rack:` 🟡 建議評估液冷方案
* `> 50 kW/Rack:` 🔴 強烈建議液冷方案 (突破氣冷物理極限)

**2. 為什麼單機櫃上限設定為 72 節點？**
對標 NVIDIA GB200 NVL72 參考架構之三大物理極限：
* **空間極限 (U-space):** 機櫃需容納運算匣、Switch 與水冷 Manifold，已達飽和。
* **訊號極限 (Signal Integrity):** GPU 間透過銅線傳輸，72 節點之高度為 NVLink 訊號不衰減之極限。
* **供電極限 (Power Limit):** 單櫃總功耗達 100-120kW，觸及多數先進機房供電天花板。

---

## 🛣️ 未來優化發展 (Product Roadmap)

作為一個持續迭代的商業決策產品，下一階段規劃導入：

1. **機房佔地成本模組 (Floor Space Cost)：** 將液冷架構「高密度、少機櫃」省下的實體廠房租金納入 CapEx/OpEx 抵扣，凸顯液冷隱性優勢。
2. **淨現值折現率 (NPV Discount Rate)：** 導入貨幣時間價值概念，將 5 年後的節省電費進行折現，符合大型 IT 採購之企業財報精算慣例。
3. **真實 API RAG 串接：** 將目前的 `cooling_kb.js` 升級，實際串接企業內部技術文檔的向量資料庫 (Vector DB)，實現真正的低 Token 消耗精準問答。
