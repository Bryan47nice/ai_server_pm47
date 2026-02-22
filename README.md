# 📊 AI Server Cooling TCO Calculator & NPI PM Portfolio
**AI 伺服器散熱 TCO 評估儀表板 暨 專案管理思維作品集**

> **製作者：** 莊仕祺 (Bryan) 
> **Live Demo (線上預覽)：** [https://bryan47nice.github.io/ai_server_pm47/]

## 1. 專案概述 (Project Overview)
本專案為一款專為 B2B 伺服器代工廠 (ODM) 與企業 IT 採購端設計的**互動式商業決策輔助工具**。
隨著高階 AI 晶片（如 NVIDIA GB200）功耗激增，散熱基礎設施的選擇成為資料中心建置的最大痛點。本工具透過視覺化數據面板，協助客戶快速評估「氣冷 (Air Cooling)」與「液冷 (Liquid Cooling)」方案在五年週期內的總擁有成本 (TCO)，找出建置成本 (CapEx) 與營運電費 (OpEx) 的黃金交叉點。

此外，專案內附「軟體轉硬體 NPI 專案管理對照表」，展現軟體敏捷思維如何無縫接軌並加速硬體製造流程。

## 2. 核心功能模組 (Core Features)

### 📈 Module A: TCO 商業決策儀表板
* **動態情境模擬：** 支援下拉選擇 AI 晶片能耗模型（H100 / GB200），並可透過滑桿動態調整「單機櫃伺服器數量 (Servers per Rack)」，即時推演不同機櫃密度 (Rack Density) 下的能耗衝擊。
* **智慧推薦引擎：** 依據單機櫃功耗 (kW/Rack) 動態給予基礎設施建議（氣冷 / 評估液冷 / 強烈建議液冷）。
* **財務視覺化：** 使用 Chart.js 繪製 5 年 TCO 累積成本折線圖，即時計算並標示「五年總節省成本」與「投資回本年限 (Break-even Point)」。

### 🧠 Module B: 跨領域專案管理思維 (Mindset Translation)
* 針對硬體 NPI 流程（EVT ➔ DVT ➔ PVT ➔ MP）梳理的專案管理心法。
* 對比軟體敏捷開發與硬體製造的風險控管差異，展示 Issue Tracking 與 Root Cause Analysis (RCA) 的落地執行策略。

### 🛠️ Module C: 企業級 UI/UX 體驗
* **企業級報表輸出 (Print-optimized PDF)：** 針對 A4 列印優化 CSS，確保匯出商業評估報告時排版清晰、圖表不破版。
* **深淺色模式自適應 (Dark/Light Mode)：** 支援右下角一鍵切換日夜模式，並使複雜圖表自動適應底色，提供最佳閱讀體驗。

## 3. 系統運算邏輯與假設 (Business Logic & Assumptions)

為確保計算結果符合伺服器產業現實，系統底層採用以下關鍵假設值（預設值）：

### 散熱臨界值判定 (Cooling Thresholds)
* **< 30 kW/Rack：** 🟢 推薦氣冷方案
* **30 kW - 50 kW/Rack：** 🟡 建議評估液冷方案 (Evaluate DLC)
* **> 50 kW/Rack：** 🔴 強烈建議液冷方案 (突破氣冷物理極限)

### 成本估算模型 (Cost Modeling)
* **PUE (電力使用效率)：** 氣冷預設 $1.4$；液冷預設 $1.15$
* **機櫃建置成本 (CapEx)：** 氣冷預估 $\$15,000$ USD/Rack；液冷預估 $\$45,000$ USD/Rack
* **五年電費計算 (OpEx Formula)：** $$OpEx = Total\ kW \times PUE \times 24\ (hours) \times 365\ (days) \times Power\ Rate \times 5\ (years)$$

## 4. 技術架構 (Tech Stack)
* **前端骨架：** HTML5, Vanilla JavaScript
* **UI 樣式與排版：** Tailwind CSS (包含 Dark Mode 與 Print 狀態控制)
* **圖表渲染：** Chart.js (支援動態重繪與深淺色自適應)
* **部署與版控：** Git / GitHub Pages

## 5. 未來產品藍圖 (Future Roadmap)
* [ ] **ESG 減碳指標整合：** 量化液冷方案省下的電力，換算為減少的碳排放噸數。
* [ ] **空間坪效計算 (Floor Space)：** 展現高密度液冷機櫃節省資料中心佔地面積的隱形成本優勢。
* [ ] **客製化報告輸出：** 支援一鍵帶入客戶公司 Logo，強化 Pre-sales 銷售體驗。
