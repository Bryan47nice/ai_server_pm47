// AI Server TCO Dashboard - Globalization Dictionary
        const dict = {
            zh: {
                "t-tab-tco": "AI 伺服器 TCO 評估儀表板", "t-tab-mindset": "產品企劃：專案管理思維對照",
                "t-author": "製作者：莊仕祺 (Bryan)", "t-export": "匯出 PDF",
                "t-basic-settings": "基礎參數設定", "t-chip-model": "AI 伺服器型號",
                "t-opt-h100": "NVIDIA H100 (單台約 1kW)", "t-opt-gb200": "NVIDIA GB200 NVL72 (單台約 1.2kW)",
                "t-total-servers": "總伺服器數量 (台)", "t-power-rate": "電費費率 (USD/kWh)",
                "t-servers-per-rack": "單機櫃伺服器數量", "t-power-per-rack": "單機櫃功耗:", "t-total-racks": "預估機櫃總數:",
                "t-adv-settings": "進階環境設定 (Advanced)", "t-eval-years": "評估年限 (Years)", 
                "t-util-rate": "伺服器稼動率 (%)", // 新增
                "t-tt-util-title": "什麼是稼動率 (Utilization Rate)？", // 新增
                "t-tt-util-desc": "現實中伺服器不會 24 小時皆處於 100% 滿載運作。設定實際的平均負載率（如 80%），能讓耗電量與營運成本的估算更貼近資料中心真實營運狀況。", // 新增
                "t-formula-title": "營運成本 (OpEx) 運算邏輯透明化", // 新增
                "t-formula-desc": "每年 OpEx = 總功耗(kW) × PUE × 稼動率(%) × 8,760小時 × 電費費率", // 新增
                "t-formula-note": "* 註：PUE (電力使用效率) 代表機房冷卻等基礎設施的額外耗能比例。液冷能大幅降低 PUE，是省下巨額 OpEx 的關鍵。", // 新增
                "t-tt-year-title": "為什麼預設是 5 年？",
                "t-tt-year-desc": "企業 IT 硬體基礎設施的會計折舊攤提通常為 3-5 年；此外，高階運算晶片的世代汰換週期 (Refresh Cycle) 亦約為此區間。因此業界實務多以 5 年作為 TCO 衡量基準。", 
                "t-air-pue": "氣冷 PUE", "t-liq-pue": "液冷 PUE",
                "t-air-capex": "氣冷單機櫃 CapEx ($)", "t-liq-capex": "液冷單機櫃 CapEx ($)",
                "t-air-total-capex": "總 CapEx:", "t-liq-total-capex": "總 CapEx:",
                "t-rec-title": "系統強烈建議", "t-breakeven-title": "黃金交叉點",
                "t-tt-title": "為什麼上限設定為 72 台 (節點)？",
                "t-tt-1": "<b>空間極限：</b>機櫃需容納運算匣與水冷設備，已達空間飽和。",
                "t-tt-2": "<b>訊號極限：</b>GPU 間透過銅線傳輸，72 節點高度是訊號極限。",
                "t-tt-3": "<b>設施極限：</b>單櫃功耗達 100-120kW，觸及機房供電天花板。",
                "t-hero-title": "專案管理的核心：載體不同，邏輯一致",
                "t-hero-sub": "「將過去帶領團隊、推動複雜系統落地的軟體敏捷思維，轉化為驅動 AI 伺服器硬體 Product Planning 流程加速的引擎。」",
                "t-c1-tag": "1. 產品藍圖與生命週期", "t-c1-old-h": "【過去】軟體產品開發", "t-c1-old-v": "Sprint 迭代 / Release", "t-c1-old-d": "定義需求並透過敏捷衝刺，確保軟體功能如期交付上線。",
                "t-c1-new-h": "【現在】雲端伺服器產品企劃", "t-c1-new-v": "Roadmap ➔ NPI ➔ MP", "t-c1-new-d": "擬定符合市場需求的產品規格發展，並與 RD 合作掌控 NPI 研發時程。",
                "t-c2-tag": "2. 市場洞察與分析", "t-c2-old-h": "【過去】軟體產品開發", "t-c2-old-v": "User Research & 數據分析", "t-c2-old-d": "收集用戶回饋與平台數據，定義產品規格與功能優先級。",
                "t-c2-new-h": "【現在】雲端伺服器產品企劃", "t-c2-new-v": "技術趨勢調研與概念驗證", "t-c2-new-d": "針對硬體散熱趨勢(Air/Liquid)收集有利資訊，進行概念驗證與規格收斂。",
                "t-c3-tag": "3. 跨部門溝通與橋樑", "t-c3-old-h": "【過去】軟體產品開發", "t-c3-old-v": "RD / UIUX / QA 樞紐", "t-c3-old-d": "整合技術、設計與商業需求，解決開發期間的衝突與 Bug。",
                "t-c3-new-h": "【現在】雲端伺服器產品企劃", "t-c3-new-v": "Sales / RD / 客戶端橋樑", "t-c3-new-d": "協助釐清客戶規格需求，並對 Sales 團隊進行新產品上市的技術培訓。",
                "t-footer-title": "💡 為什麼軟體背景是 AI Server Planner 的隱藏優勢？",
                "t-footer-1": "**軟體定義硬體 (Software-Defined Hardware)：** 現代 AI 伺服器高度依賴 BMC (遠端管理晶片) 與軟體整合，具備軟體敏銳度更能掌握系統層級的技術架構。",
                "t-footer-2": "**敏捷迭代力 (Agile Adaptability)：** 面對 AI 晶片快速換代的市場，能以敏捷思維快速調整產品 Roadmap 與 Go-to-Market 策略。"
            },
            en: {
                "t-tab-tco": "AI Server TCO Dashboard", "t-tab-mindset": "Product Planning Mindset",
                "t-author": "Created by: Bryan Jhuang", "t-export": "Export PDF",
                "t-basic-settings": "Basic Configurations", "t-chip-model": "AI Server Model",
                "t-opt-h100": "NVIDIA H100 (~1kW per node)", "t-opt-gb200": "NVIDIA GB200 NVL72 (~1.2kW per node)",
                "t-total-servers": "Total Servers (Nodes)", "t-power-rate": "Power Rate (USD/kWh)",
                "t-servers-per-rack": "Servers per Rack", "t-power-per-rack": "Power per Rack:", "t-total-racks": "Est. Total Racks:",
                "t-adv-settings": "Advanced Settings", "t-eval-years": "Evaluation Years", 
                "t-util-rate": "Utilization Rate (%)", // 新增
                "t-tt-util-title": "What is Utilization Rate?", // 新增
                "t-tt-util-desc": "Servers rarely run at 100% load 24/7. Setting a realistic average load (e.g., 80%) aligns power and cost estimations with actual data center operations.", // 新增
                "t-formula-title": "Operational Expenditure (OpEx) Formula", // 新增
                "t-formula-desc": "Annual OpEx = Total Power(kW) × PUE × Utilization Rate(%) × 8,760 hours × Power Rate", // 新增
                "t-formula-note": "* Note: PUE (Power Usage Effectiveness) represents overhead for cooling/infra. Liquid cooling drastically lowers PUE, which is the key driver for OpEx savings.", // 新增
                "t-tt-year-title": "Why default to 5 years?",
                "t-tt-year-desc": "Accounting depreciation for enterprise IT hardware is typically 3-5 years. The generational refresh cycle for high-end compute chips also falls in this range, making 5 years the industry standard for TCO baselines.",
                "t-air-pue": "Air Cooling PUE", "t-liq-pue": "Liquid Cooling PUE",
                "t-air-capex": "Air Rack CapEx ($)", "t-liq-capex": "Liquid Rack CapEx ($)",
                "t-air-total-capex": "Total CapEx:", "t-liq-total-capex": "Total CapEx:",
                "t-rec-title": "System Recommendation", "t-breakeven-title": "Break-even Point",
                "t-tt-title": "Why is the limit set to 72 nodes?",
                "t-tt-1": "<b>Space Limit:</b> Rack is fully packed with compute trays and cooling equipment.",
                "t-tt-2": "<b>Signal Limit:</b> 72 nodes span the max vertical distance for copper (NVLink).",
                "t-tt-3": "<b>Infra Limit:</b> Power reaches 100-120kW, hitting data center ceilings.",
                "t-hero-title": "Core Project Management: Different Medium, Same Logic",
                "t-hero-sub": "\"Transforming the agile mindset of leading software teams into an engine that accelerates AI Server Product Planning and NPI processes.\"",
                "t-c1-tag": "1. Product Roadmap & Lifecycle", "t-c1-old-h": "[Past] Software Development", "t-c1-old-v": "Sprint Iteration / Release", "t-c1-old-d": "Define requirements and ensure on-time delivery through agile sprints.",
                "t-c1-new-h": "[Now] Cloud Server Product Planning", "t-c1-new-v": "Roadmap ➔ NPI ➔ MP", "t-c1-new-d": "Formulate product roadmaps aligned with market demands and track NPI schedules with RD.",
                "t-c2-tag": "2. Market Insight & Analysis", "t-c2-old-h": "[Past] Software Development", "t-c2-old-v": "User Research & Data Analytics", "t-c2-old-d": "Gather user feedback and platform data to prioritize product specifications.",
                "t-c2-new-h": "[Now] Cloud Server Product Planning", "t-c2-new-v": "Tech Trend Research & PoC", "t-c2-new-d": "Gather intelligence on cooling trends (Air/Liquid) for Proof of Concept and spec definition.",
                "t-c3-tag": "3. Cross-functional Bridge", "t-c3-old-h": "[Past] Software Development", "t-c3-old-v": "RD / UIUX / QA Hub", "t-c3-old-d": "Integrate tech, design, and business needs to resolve conflicts and bugs.",
                "t-c3-new-h": "[Now] Cloud Server Product Planning", "t-c3-new-v": "Sales / RD / Client Bridge", "t-c3-new-d": "Clarify client spec requirements and provide technical sales training for Go-to-Market strategies.",
                "t-footer-title": "💡 Why is a Software Background a Hidden Advantage for an AI Server Planner?",
                "t-footer-1": "**Software-Defined Hardware:** Modern AI servers heavily rely on BMC and software integration. A software mindset helps grasp system-level architectures.",
                "t-footer-2": "**Agile Adaptability:** In a market with rapid AI chip iterations, agile thinking allows for quick adjustments to Product Roadmaps and GTM strategies."
            }
        };
