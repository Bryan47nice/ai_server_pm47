# 📊 AI Server Cooling TCO Dashboard & Product Planning Portfolio
**AI 伺服器散熱 TCO 評估儀表板 暨 產品企劃思維展示**

> **製作者：** 莊仕祺 (Bryan) 
> **Live Demo (線上預覽)：** [https://bryan47nice.github.io/ai_server_pm47/]

## 1. 專案概述 (Project Overview)
本專案為一款專為 B2B 伺服器代工廠 (ODM) 產品企劃、Sales 與企業 IT 採購端設計的**互動式商業決策輔助工具**。
隨著高階 AI 晶片（如 NVIDIA GB200）功耗激增，資料中心散熱基礎設施的轉型成為關鍵痛點。本工具透過視覺化數據面板，協助第一線業務與客戶快速評估「氣冷 (Air Cooling)」與「液冷 (Liquid Cooling)」方案在指定年限內的總擁有成本 (TCO)，找出建置成本 (CapEx) 與營運電費 (OpEx) 的黃金交叉點。

此外，專案內附「軟體轉硬體 Product Planning 專案管理對照表」，展現軟體敏捷思維如何無縫接軌並加速硬體產品藍圖規劃與 NPI 流程。

## 2. 核心功能模組 (Core Features)

### 📈 Module A: 參數連動與精算儀表板 (TCO Engine)
* **雙向綁定與即時試算：** 「單機櫃伺服器數量」支援滑桿與精確輸入雙向連動，即時換算機櫃總數與單櫃功耗。
* **真實營運還原 (Utilization Rate)：** 導入「伺服器稼動率」參數，破除 100% 滿載的理想假設，讓耗電量估算更貼近資料中心真實狀況。
* **智慧推薦與公式透明化：** 依據單櫃功耗動態給予散熱方案建議，並展示 OpEx 運算白盒公式，建立客戶信任感。

### 🔍 Module B: 互動式下鑽分析 (Drill-down UI)
* **年度成本拆解：** 點擊 Chart.js 折線圖上的任意年份節點，即彈出「年度算式拆解面板」。
* **雙欄橫向對比：** 左右並列該年度氣冷與液冷的 CapEx (建置) 與 OpEx (營運) 累計明細，並自動結算該年度的「勝出方案」與「節省總額」。

### 🪄 Module C: 業務賦能與狀態機管理 (Sales Enablement)
* **動態教戰報告生成：** 依據當下 TCO 計算結果，一鍵產出對應的「核心說帖 (Elevator Pitch)」、「反對意見克服」與「財務 ROI 亮點」。
* **嚴謹的 UI State Machine：** 具備 Skeleton Loading (骨架屏載入動畫) 與 Error Handling 體驗。
* **防呆覆蓋機制 (Dirty State)：** 當報告產出後，若使用者再次修改硬體參數，系統會自動利用 Overlay 覆蓋過期報告，提醒「參數已變更」，確保業務拿到手的數據 100% 準確。
* **模擬 RAG 技術知識庫：** 內建輕量化技術字典，模擬接接 NotebookLM 知識庫，業務可針對「漏液、空間、維護」進行即時關鍵字問答。

### 🌐 Module D: 企業級 UI/UX 體驗
* **i18n 中英雙語解耦：** 全站支援即時中英切換（含圖表標籤與 Tooltip）。
* **列印最佳化 (@media print)：** 針對 A4 報告輸出客製化 CSS，自動隱藏操作按鈕，確保 PDF 匯出清晰不破版。
* **Domain Knowledge 提示：** 於關鍵參數旁加入 Hover Tooltip，解釋硬體物理極限 (如 72 節點的空間/訊號/供電限制)。

## 🏗️ 系統架構與模組化設計 (System Architecture)

為確保專案具備高度擴展性，本系統揚棄單一檔案開發，全面採用 **MVC (Model-View-Controller) 解耦架構**，展現軟體工程維護視角：

* 📄 **`index.html` (View):** 專注於 UI 佈局、Tailwind 樣式管理、CSS 動畫與 Tab 切換狀態呈現。
* ⚙️ **`tco_engine.js` (Controller & Logic):** 核心運算大腦。封裝硬體功耗換算、Chart.js 渲染與業務報告的狀態機攔截機制。
* 🌐 **`i18n_dict.js` (Data - L10n):** 獨立語系資料字典。未來擴充第三語言無需更動核心代碼。
* 🧠 **`cooling_kb.js` (Data - RAG Mock):** 獨立技術知識庫。存放散熱 Domain Knowledge，模擬 AI 檢索資料源。

## 3. 系統運算邏輯與假設 (Business Logic & Constraints)

### 硬體架構極限：為何單機櫃上限設定為 72 台？
本系統刻意將單機櫃節點上限設為 72，係對標 NVIDIA GB200 NVL72 參考架構之三大物理極限：
1. **空間極限 (Rack U-space)：** 42U-48U 機櫃需容納運算匣、Switch 與水冷 Manifold，空間已達飽和。
2. **訊號極限 (Signal Integrity)：** GPU 間透過銅線 (Copper Cables) 傳輸，72 節點之機櫃高度為 NVLink 訊號不衰減之極限。
3. **基礎設施供電極限 (Power Limit)：** 單櫃總功耗達 100-120kW，已觸及多數先進機房之供電天花板。

## 4. 技術架構 (Tech Stack)
* **前端骨架：** HTML5, Vanilla JavaScript
* **UI 樣式與排版：** Tailwind CSS (包含 Dark Mode, Group-hover Tooltip 與 Print 狀態控制)
* **圖表渲染：** Chart.js (支援動態重繪與深淺色自適應)
* **部署與版控：** Git / GitHub Pages

## 5. 未來產品藍圖 (Future Roadmap)
作為一個商業決策產品，為滿足更深度的企業採購精算需求，下一階段規劃導入以下核心參數：
- [ ] **導入進階財務模型：** 加入 NPV (淨現值) 與折現率 (Discount Rate) 計算，讓財務指標更符合大型企業 CFO 的審核標準。
- [ ] **整合 RAG 專屬知識庫：** 規劃介接 NotebookLM 或向量資料庫，讓 Sales AI 助手能根據內部散熱技術文件（如 ABL 測試報告、漏液防護規範）進行精準問答。
- [ ] **客製化硬體配置模組：** 允許使用者自定義 Server TDP 與冷卻解熱能力上限，從預設型號走向高度客製化。
- [ ] **報表 CSV 匯出功能：** 讓技術人員能將各年度算式匯出，方便後續在 Excel 進行二次加工。
