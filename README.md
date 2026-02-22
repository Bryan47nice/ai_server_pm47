# 📊 AI Server Cooling TCO Dashboard & Product Planning Portfolio
**AI 伺服器散熱 TCO 評估儀表板 暨 產品企劃思維展示**

> **製作者：** 莊仕祺 (Bryan) 
> **Live Demo (線上預覽)：** [https://bryan47nice.github.io/ai_server_pm47/]

## 1. 專案概述 (Project Overview)
本專案為一款專為 B2B 伺服器代工廠 (ODM) 產品企劃、Sales 與企業 IT 採購端設計的**互動式商業決策輔助工具**。
隨著高階 AI 晶片（如 NVIDIA GB200）功耗激增，資料中心散熱基礎設施的轉型成為關鍵痛點。本工具透過視覺化數據面板，協助第一線業務與客戶快速評估「氣冷 (Air Cooling)」與「液冷 (Liquid Cooling)」方案在指定年限內的總擁有成本 (TCO)，找出建置成本 (CapEx) 與營運電費 (OpEx) 的黃金交叉點。

此外，專案內附「軟體轉硬體 Product Planning 專案管理對照表」，展現軟體敏捷思維如何無縫接軌並加速硬體產品藍圖規劃與 NPI 流程。

## 2. 核心功能模組 (Core Features)

### 📈 Module A: 參數連動與財務決策儀表板 (TCO Engine)
* **雙向綁定與即時試算：** 「單機櫃伺服器數量」支援滑桿 (Slider) 與精確輸入框雙向連動，並即時換算「預估機櫃總數」與「單機櫃功耗」，大幅降低使用者的運算認知負荷。
* **智慧推薦引擎：** 依據單機櫃功耗 (kW/Rack) 動態給予散熱基礎設施建議（氣冷 / 評估液冷 / 強烈建議液冷）。
* **自定義進階參數 (Advanced Settings)：** 釋放氣冷/液冷 PUE 值與單機櫃建置成本 (CapEx)，並自動彙算「總 CapEx」，滿足專業架構師的精算需求。
* **自訂評估年限與動態繪圖：** 支援自定義 TCO 評估年限 (精確至小數點後 1 位)，Chart.js 折線圖與結算面板將即時重繪，呈現「總節省成本」與精確的「投資回本年限 (Break-even Point)」。

### 🌐 Module B: 企業級 UI/UX 體驗與雙語支援
* **i18n 中英雙語一鍵切換：** 針對全球化商務與外商客戶展示需求，內建字典檔支援全站（含圖表標籤與 Tooltip）即時中英切換。
* **列印最佳化 (Print-optimized PDF)：** 針對 A4 列印客製化 CSS (`@media print`)，自動隱藏操作按鈕並重構 Grid 排版，確保一鍵匯出商業評估報告時圖表清晰不破版。
* **深淺色模式自適應 (Dark/Light Mode)：** 支援右下角一鍵切換日夜模式，圖表座標軸與格線自動適應底色，提供最佳閱讀體驗。
* **Domain Knowledge 懸浮提示 (Tooltip)：** 於關鍵參數旁加入 (i) 知識點，解釋硬體物理極限與業界會計慣例，協助 Sales 進行客戶教育。

## 3. 系統運算邏輯與假設 (Business Logic & Constraints)

### 散熱臨界值判定 (Cooling Thresholds)
* **< 30 kW/Rack：** 🟢 推薦氣冷方案
* **30 kW - 50 kW/Rack：** 🟡 建議評估液冷方案 (Evaluate DLC)
* **> 50 kW/Rack：** 🔴 強烈建議液冷方案 (突破氣冷物理極限)

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
* [ ] **伺服器稼動率 (Utilization Rate)：** 破除 100% 滿載假設，依據資料中心實際平均負載 (如 60%-80%) 動態調整耗電量，反映更真實的回本時間。
* [ ] **機房空間佔地成本 (Floor Space Cost)：** 將液冷架構「高密度、少機櫃」省下的龐大實體廠房租金/建置成本納入 CapEx 計算，凸顯液冷隱性優勢。
* [ ] **淨現值折現率 (NPV Discount Rate)：** 導入貨幣時間價值概念，將 5 年後的節省電費進行折現，符合大型 IT 採購之企業財報精算慣例。
