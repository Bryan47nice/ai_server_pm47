# 面試準備文件｜鴻佰科技 NQ-NPI Project Management (Project Junior Manager)
> 製作者：莊仕祺 (Bryan) ｜ 職缺連結：https://www.104.com.tw/job/8kig5

---

## 一、職缺核心需求 × 作品集工具對照表

| JD 工作任務 | 對應作品集工具 | 我能說的話 |
|---|---|---|
| Material readiness management | **備料追蹤儀表板** (Tab: 運營) | 我設計了一套備料看板，支援正推/逆推兩種排程模式，可即時追蹤 GPU、HBM、PCB、CDU 等關鍵零件狀態 |
| Schedule pull-in to hit project schedule | **排程 Pull-in 模擬器** (NPI Tab) | 我開發了 Pull-in 模擬器，輸入各階段延遲天數，自動換算業務衝擊：日違約金 × 合約數量 + 機會成本 |
| Schedule control / team coordination | **Phase Checkpoint + RACI 矩陣** (NPI Tab) | 我整理了 RFQ → EVT → DVT → PVT → MP 五階段 PJM 核心任務、常見卡點與高風險警示；RACI 矩陣覆蓋正常/供應商延遲/緊急 Pull-in 三種情境 |
| Lead material readiness discussions with customers | **TCO 分析 + AI Sales 提案報告** (TCO Tab) | 我做了一個 TCO 評估工具，可一鍵產出含 ROI、ESG 效益、部署風險的 Sales 說帖，練習把技術語言轉換成客戶聽得懂的語言 |
| Coordinating with suppliers and functional teams | **Gate Review Simulator** (NPI Tab) | 我模擬了 Go / Conditional Go / Hold 的決策機制，反映與供應商、跨職能團隊協調時的真實決策場景 |

---

## 二、自我介紹腳本（建議 2 分鐘內）

> 中文版

「我叫莊仕祺，大家叫我 Bryan。我有超過 4 年跨部門專案管理經驗，主要聚焦在 AI 伺服器產品從規劃到量產的全流程。

為了準備這次面試，我特別做了一個作品集網站，裡面有三個核心工具：

第一個是 **AI 伺服器 TCO 分析工具**，可以比較氣冷和液冷方案在不同規模下的 5 年總成本，並自動產出 Sales 提案報告。這個工具讓我學會如何用數字說服客戶做技術決策。

第二個是 **NPI 管理中心**，覆蓋 RFQ、EVT、DVT、PVT 到 MP 五個階段，每個階段都有 PJM 核心任務清單、常見卡點分析，以及跨職能 RACI 矩陣。這直接對應到 PJM 的日常工作。

第三個是**備料追蹤儀表板 + Pull-in 模擬器**，可以追蹤 GPU、HBM 等關鍵零件的備料狀態，並計算排程 Pull-in 的業務衝擊金額。

鴻佰的業務正好在 AI Server 和水冷產品這個我最熟悉的領域，我認為我可以快速上手並帶來實質貢獻。」

---

> 英文版（備用）

"Hi, I'm Bryan Chuang. I have 4+ years of cross-functional project management experience in AI server products, from planning through mass production.

To prepare for this interview, I built a portfolio website with three key tools:

First, an **AI Server TCO Analysis Dashboard** that compares 5-year total cost of ownership for air cooling vs. liquid cooling, and auto-generates sales proposals — this helped me practice translating hardware constraints into customer-facing value propositions.

Second, an **NPI Management Center** covering all five phases: RFQ, EVT, DVT, PVT, and MP. Each phase includes PJM task checklists, common blockers, and a RACI matrix across Normal, Supplier Delay, and Emergency Pull-in scenarios.

Third, a **Material Readiness Dashboard and Schedule Pull-in Simulator** — tracking critical parts like GPU, HBM, PCB, and CDU, with a pull-in impact calculator that quantifies daily penalty costs and opportunity cost.

Hongbai's focus on AI servers and liquid cooling is exactly the domain I'm most prepared for, and I'm excited to contribute from day one."

---

## 三、作品集各工具詳細說法

### Tool 1｜AI 伺服器 TCO 分析（Tab: TCO）

**工具功能說明：**
- 輸入：晶片型號（H100 / GB200 / Rubin）、伺服器數量、電費費率、PUE、單櫃 CapEx、評估年限、稼動率
- 輸出：5 年氣冷 vs 液冷累積成本折線圖、黃金交叉點（Breakeven）、5 年節省金額
- 進階：多情境並排比較，可匯出比較圖卡 PNG
- AI 功能：一鍵產出 Sales 提案報告（核心說帖 / 反對意見克服 / ROI 亮點 / ESG 減碳效益 / 建置風險）

**面試話術：**
「這個工具的設計出發點是：業務在面對客戶時，常常不知道怎麼用數字說服對方升級到液冷方案。我的工具讓 Sales 只需輸入客戶的規模參數，就能立刻拿到一份結構化的提案報告，包含 ROI、ESG 效益和風險說明。這和 JD 裡 'Lead material readiness discussions with customers' 的精神一致——讓數據說話，降低溝通成本。」

---

### Tool 2｜NPI Phase Checkpoint（Tab: NPI → Phase Checkpoint）

**工具功能說明：**
- 覆蓋 5 個 NPI 階段：RFQ (M-18~M-12)、EVT (M-12~M-8)、DVT (M-8~M-5)、PVT (M-5~M-2)、MP (M-0+)
- 每個階段呈現：
  - **PJM 核心任務**（4 項）
  - **常見卡點** Bottlenecks（3 項）
  - **高風險警示** Risk Alert（1 項）
- 附跨職能風險熱力圖：EE / ME / Thermal / Procurement / Factory 各階段風險集中度

**面試話術：**
「我在整理這個工具時，刻意從 PJM 的角度思考——每個階段我的任務是什麼？什麼地方最容易卡？哪個風險最致命？

比如 DVT 階段，最大的風險是 GPU Lead Time 超過 20 週導致樣品延遲，以及上游晶片廠（如 NVIDIA）臨時更新規格觸發 BOM 修改。這些都是我在研究 AI Server NPI 流程後，認為 PJM 必須提前預判的卡點。」

---

### Tool 3｜排程 Pull-in 模擬器（Tab: NPI → 排程 Pull-in）

**工具功能說明：**
- 輸入：各 NPI 階段的延遲天數（滑桿調整）
- 計算業務衝擊：
  - 售價 × 合約數量 × 日違約金率
  - 機會成本（競品搶市佔的時間窗口損失）
- 輸出：Pull-in 總天數目標、每日延遲成本、5 年機會成本總額

**面試話術：**
「這個工具解決的核心問題是：PM 在推動 Pull-in 時，往往說不清楚『晚 5 天到底有多貴』。我把它量化了。

當你對 RD 或供應商說『再延 5 天就是 XX 萬違約金加 YY 萬機會成本』，談判效率會完全不同。這直接對應到 JD 的第一條：Material readiness management + schedule pull-in to hit project schedule。」

---

### Tool 4｜RACI 協調矩陣（Tab: NPI → RACI）

**工具功能說明：**
- 三種情境切換：正常推進 / 供應商延遲 / 緊急 Pull-in
- 覆蓋職能：PJM / RD (EE) / RD (ME) / Thermal / Procurement / Factory / Sales / Customer
- 每個任務節點標示 R（執行）、A（負責）、C（諮詢）、I（知會）

**面試話術：**
「RACI 矩陣的設計讓我意識到一件事：在緊急 Pull-in 情境下，很多平時 'I'（只需知會）的角色會臨時升格成 'C' 甚至 'R'。如果事先沒有明確定義，緊急時就會出現『找不到人拍板』的混亂。

這個工具幫助我理解：PJM 的核心價值不只是追進度，而是在組織混亂時讓每個人知道自己的角色。」

---

### Tool 5｜Gate Review Simulator（Tab: NPI → Gate Review）

**工具功能說明：**
- 模擬 EVT → DVT → PVT 三個關鍵 Gate 的 Go / Conditional Go / Hold 決策
- 評分維度：樣品到位率、BOM Freeze 狀態、Yield Rate、測試通過率等
- Hold 情境會動態顯示實際失分項目與升級路徑

**面試話術：**
「Gate Review 模擬器讓我練習了一個關鍵判斷：什麼情況下要硬推 Go、什麼情況下要 Hold？Hold 的代價是時程，不 Hold 的代價是品質風險。

在 AI Server 這種高客製化、高壓力的產品線，PJM 必須有這個判斷力，而不是一味追趕時程。」

---

### Tool 6｜備料追蹤儀表板（Tab: 運營 & 思維）

**工具功能說明：**
- 預設追蹤零件：GPU、HBM、PCB、Cooling CDU、PSU、Switch、Cable 等
- 支援**正推模式**（從備料狀態推算最快出貨日）與**逆推模式**（從出貨目標日倒推備料需求）
- 可新增自訂零件，設定狀態標籤（On Track / At Risk / Delayed）
- 篩選功能：依狀態、零件類型快速定位問題項目

**面試話術：**
「備料追蹤儀表板直接對應 JD 的第一條任務：Material readiness management。

我設計了兩種排程模式——當有明確客戶承諾交期時，用逆推模式計算每個零件最晚到料日；當交期尚未確認時，用正推模式從現有備料狀態估算最快可出貨時間。這個邏輯在實際專案中非常實用。」

---

## 四、預期面試問答 Q&A

**Q: 你沒有在 AI Server 公司工作過，為什麼認為自己能上手？**
A: 「我用實際行動回答這個問題——我的作品集網站是我自主研究、設計和開發的 PoC 工具，覆蓋了 AI Server NPI 全流程、TCO 計算邏輯、備料管理和 Pull-in 模擬。我認為理解業務邏輯比工作年資更重要，而我已經做了功課。」

**Q: PJM 工作很瑣碎，你能接受嗎？**
A: 「我設計 NPI Phase Checkpoint 工具的時候，刻意把每個階段最『瑣碎』的追蹤任務都列出來——每週 Issue Review 會議、零件 AVL 認証追蹤、Issue List 收斂。我理解這些細節正是 PJM 的核心價值所在，做好細節才能讓整個專案不失速。」

**Q: 你的英文溝通能力如何？**
A: 「我的作品集網站支援中英雙語切換，所有工具的專業術語（BOM Freeze、AVL、Schedule Pull-in、RACI）我都可以用英文精準表達。TOEIC 910 Gold。」

**Q: 你對鴻佰科技的了解？**
A: 「鴻佰是鴻海集團旗下專注於 AI Server 和水冷解決方案的子公司，產品線包含 NQ 系列伺服器和 CDU 水冷模組。我特別關注水冷方案，因為我在 TCO 工具裡做了完整的氣冷 vs 液冷分析——在 GB200/Rubin 這類高功耗平台下，液冷的 TCO 優勢在 2~3 年內就會超越氣冷方案。」

**Q: 你最大的弱點是什麼？**
A: 「我目前沒有直接在製造現場管理 PVT/MP 的經驗。但我透過深入研究 NPI 流程、整理每個階段的卡點和風險，建立了系統性的理解框架。我知道自己需要在工廠端補足實務，這也是我選擇 PJM 這個職位的原因——我想從第一線的實戰中補全這塊。」

---

## 五、作品集網站分享連結

**預設情境（100台 H100，5年評估）：**
https://bryan47nice.github.io/ai_server_pm47/?tab=tco&chip=1&servers=100&nodes=32&cost=0.10&years=5&util=80&air_pue=1.40&liq_pue=1.15&air_capex=15000&liq_capex=45000

**NPI Phase Checkpoint：**
https://bryan47nice.github.io/ai_server_pm47/?tab=npi

**建議面試時操作順序：**
1. 先開 About Me Tab 介紹自己（30秒）
2. 切到 TCO Tab，調整參數 Demo（60秒）
3. 切到 NPI Tab，點 Phase Checkpoint 解說卡點邏輯（60秒）
4. 切到 NPI → 排程 Pull-in，展示業務衝擊計算（30秒）
5. 切到備料追蹤儀表板，說明正推/逆推邏輯（30秒）

---

## 六、關鍵術語速查（中英對照）

| 中文 | 英文 |
|---|---|
| 備料管理 | Material Readiness Management |
| 排程提前 | Schedule Pull-in |
| 設計驗證測試 | DVT - Design Verification Test |
| 工程驗證測試 | EVT - Engineering Verification Test |
| 量產驗證測試 | PVT - Production Verification Test |
| 量產 | MP - Mass Production |
| 物料清單 | BOM - Bill of Materials |
| 長交期零件 | Long Lead Time Parts |
| 總擁有成本 | TCO - Total Cost of Ownership |
| 電能使用效率 | PUE - Power Usage Effectiveness |
| 責任分配矩陣 | RACI Matrix |
| 冷卻分配單元 | CDU - Cooling Distribution Unit |
| 需求變更蔓延 | Scope Creep |
| 供應商核准清單 | AVL - Approved Vendor List |
| 需求建議書 | RFQ - Request for Quotation |

---

*製作日期：2026-03-26｜針對職缺：鴻佰科技 NQ-NPI Project Management (Project Junior Manager)*
