# 🚀 AI Server PM Portfolio — Interactive Decision Toolkit

> **作者 / Author：莊仕祺 Bryan Jhuang**
> 目標領域：AI Server Product Planning · NPI Management · Supply Chain PM

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-Open_Portfolio-brightgreen?style=for-the-badge)](https://bryan47nice.github.io/ai_server_pm47/)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chartdotjs&logoColor=white)
![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![i18n](https://img.shields.io/badge/i18n-ZH_%2F_EN-blue?style=flat-square)

---

## 💡 Why I Built This

AI Server 的 PM 角色橫跨客戶需求、供應鏈、NPI 工程與財務分析。
這個 Portfolio 不只是展示技術能力，而是模擬我在真實工作中會建立的決策工具：

> 「讓數據說話，把技術判斷翻譯成業務語言。」

每個模組都對應一個 PM 真實面臨的場景 — 從向 VP 提出冷卻方案的 ROI，到在 Gate Review 上決定要 Go 還是 Hold。

---

## 🗂️ 四大模組總覽

| 頁面 | 模組 | 核心場景 |
|------|------|---------|
| 💰 TCO Analysis | AI 伺服器冷卻方案財務分析 | 向客戶展示氣冷 vs 液冷的 5 年 ROI |
| 📅 NPI 管理中心 | Phase Checkpoint + 排程模擬 + RACI + Gate Review | 管理 AI Server 18 個月 NPI 流程的完整工具箱 |
| 📦 運營 & 思維 | 備料追蹤 + PM 思維框架 | 供應鏈可視化與從軟體到硬體 PM 的思維轉換 |

---

## 🔍 模組詳解

### 💰 Module 1 — AI Server TCO Analysis Engine

**場景**：客戶要決定是否導入液冷，你需要用數字說服他們。

**可調參數**：
- AI Server 型號（H100 / GB200 NVL72 / Rubin）
- 機櫃密度、PUE、電費單價、評估年限、稼動率
- CapEx（氣冷 vs 液冷每機櫃建置成本）

**輸出亮點**：
- **Golden Crossover Point**：精確到小數點的回本年份（含圖表注入）
- **多情境並排比較**：最多 4 組方案，自動找出最優解
- **AI 銷售報告一鍵生成**：Elevator Pitch + 反對意見克服 + ESG 碳減排
- **PDF / PNG 匯出**：企業級版面，解決跨頁截斷問題

---

### 📅 Module 2 — NPI Management Hub（4 個子工具）

#### 🔍 2A — Phase Checkpoint
5 個 NPI 里程碑（RFQ → DVT → EVT → PVT → MP），每個 Phase 顯示：
- PJM 核心任務清單
- 常見瓶頸與高風險警示
- 跨部門風險熱圖（6 部門 × 5 Phase）

#### 📅 2B — Schedule Pull-in Simulator + Business Impact Calculator
**排程模擬**：為每個 Phase 輸入延誤週數，即時看到 MP 日期的漣漪效應。

**商業衝擊計算**（延誤時自動顯示）：

| 參數 | 說明 |
|------|------|
| 每台售價 × 合約數量 | 總合約金額（若違約的風險上限） |
| 每日違約金 | 合約罰款估算 |
| 每週機會成本 | 客戶每週因延誤損失的部署收益 |

輸出：優先級評估（🟢 監控 / 🟠 升級 / 🔴 緊急）+ 處置行動清單 + 一鍵複製週報

#### 👥 2C — RACI Coordination Matrix
3 種情境（正常 / Supplier 延遲 / 緊急 Pull-in），動態顯示各部門責任與升級行動步驟。

#### 🎯 2D — Phase Gate Go / No-Go Simulator
**NPI 最關鍵的決策時刻**：Gate Review 要 Go 還是 Hold？

- 4 個 Gate（DVT / EVT / PVT / MP），每個有 4 條加權 Criteria
- 每條可用 slider 調整完成度（0–100%）
- 加權分數自動計算，決策建議即時更新：
  - ✅ **Go**（≥85%）：可進入下一 Phase
  - ⚠️ **Conditional Go**（65–84%）：列出低分項目 + Owner + 行動建議
  - 🚫 **Hold**（<65%）：顯示升級路徑（PJM / EE / Supply Chain 分工）

---

### 📦 Module 3 — Operations & PM Thinking

**備料追蹤儀表板**：8 種關鍵零件（GPU/HBM、PCB、CDU 等）即時顯示距 MP 的天數與備料狀態（🔴 Critical / 🟡 At Risk / 🟢 On Track）。

**PM 思維框架**：軟體 PM vs 硬體 NPI PM 的三大思維對照，展現跨領域轉換能力。

---

## 🛠️ Tech Stack

```
Frontend:   Vanilla JavaScript (ES6+) · Tailwind CSS (dark mode) · Chart.js
Export:     html2canvas · jsPDF
i18n:       Custom dict-based ZH/EN toggle (zero API dependency)
Architecture: index.html (View) · tco_engine.js (Logic) · i18n_dict.js (i18n) · cooling_kb.js (RAG mock)
```

---

## ✅ Demo 亮點功能

- 🌗 **Dark / Light Mode** 一鍵切換
- 🌐 **中英雙語** 全站即時切換（含動態渲染區塊）
- 📱 **RWD 響應式設計**（Tailwind md/lg breakpoint）
- 📤 **PDF + PNG 匯出**（企業簡報品質）
- 🎓 **Onboarding Tour**（首次造訪自動導覽，localStorage 防打擾）

---

## 📁 專案結構

```
ai_server_pm47/
├── index.html        # 主應用（View + inline JS controllers）
├── tco_engine.js     # TCO 計算引擎 + 情境管理 + Chart 渲染
├── i18n_dict.js      # 中英文字串字典（~600 keys）
├── cooling_kb.js     # 散熱技術知識庫（AI Report RAG mock data）
└── README.md
```

---

## 🎯 Interview Demo Script（面試展示路線）

```
1. TCO Tab（3 min）
   → 把伺服器數量從 100 調到 500，看 Breakeven 提前
   → 新增情境 B 改 PUE，比較兩種液冷策略的差距
   → 生成 AI 銷售報告，秀 Elevator Pitch

2. NPI Tab（4 min）
   → Phase Checkpoint 點 DVT，看風險熱圖
   → Schedule Simulator: DVT 延誤 8 週 → Revenue at Risk $1.5M → 🔴 緊急行動
   → Gate Review: 把 Supplier Qualification 拉到 60% → Conditional Go + Action Items

3. Ops Tab（1 min）
   → 調 GPU 交期從 20→28 週，狀態從 On Track 變 At Risk
```

---

## 👤 About the Author

莊仕祺 Bryan Jhuang | 4+ 年跨部門專案管理經驗 | TOEIC 910 (Gold)

專注於以軟體敏捷思維（Agile / Scrum）貫通硬體 NPI 落地，
在 AI 基礎設施爆發時代成為橋接技術與商業語言的樞紐型 PM。

📧 Contact via GitHub Issues or LinkedIn
