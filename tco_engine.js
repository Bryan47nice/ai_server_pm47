// ==========================================
// TCO Calculation Engine & Sales Report State
// ==========================================

let currentLang = 'zh'; 
let tcoChartInstance = null;
let gaugeChartInstance = null; 
let latestCalcData = {}; 

let isReportGenerated = false;
let reportCache = { zh: null, en: null };

function calculateTCO() {
    const chipPower = parseFloat(document.getElementById('chipType').value);
    const totalServers = parseInt(document.getElementById('totalServers').value);
    const serversPerRack = parseInt(document.getElementById('rackValInput').value);
    const powerCost = parseFloat(document.getElementById('powerCost').value);
    const evalYears = parseFloat(document.getElementById('evalYears').value) || 5; 
    const utilRate = parseFloat(document.getElementById('utilRate').value) / 100 || 0.8;
    const airPUE = parseFloat(document.getElementById('airPue').value);
    const liqPUE = parseFloat(document.getElementById('liqPue').value);
    const airCapExPerRack = parseFloat(document.getElementById('airCapex').value);
    const liqCapExPerRack = parseFloat(document.getElementById('liqCapex').value);

    reportCache = { zh: null, en: null };
    
    if (isReportGenerated) {
        document.getElementById('reportStateOutdated').classList.remove('hidden');
    }

    const kwPerRack = serversPerRack * chipPower;
    const totalRacks = Math.ceil(totalServers / serversPerRack);
    document.getElementById('kwPerRack').innerText = kwPerRack.toFixed(1);
    document.getElementById('totalRacksDisplay').innerText = totalRacks;

    const totalAirCapEx = totalRacks * airCapExPerRack;
    const totalLiqCapEx = totalRacks * liqCapExPerRack;
    document.getElementById('airTotalCapexDisplay').innerText = totalAirCapEx.toLocaleString();
    document.getElementById('liqTotalCapexDisplay').innerText = totalLiqCapEx.toLocaleString();

    const totalKw = totalServers * chipPower;
    const hoursPerYear = 8760;
    const airOpExPerYear = totalKw * airPUE * utilRate * hoursPerYear * powerCost;
    const liqOpExPerYear = totalKw * liqPUE * utilRate * hoursPerYear * powerCost;

    let airData = []; let liqData = []; let labels = [];
    const maxIntYear = Math.floor(evalYears);

    for (let i = 0; i <= maxIntYear; i++) {
        if (i === 0) {
            labels.push(currentLang === 'zh' ? '第0年 (建置期)' : 'Year 0 (CapEx)');
        } else {
            labels.push(currentLang === 'zh' ? `第${i}年` : `Year ${i}`);
        }
        airData.push(totalAirCapEx + (airOpExPerYear * i));
        liqData.push(totalLiqCapEx + (liqOpExPerYear * i));
    }

    if (evalYears % 1 !== 0) {
        labels.push(currentLang === 'zh' ? `第${evalYears}年` : `Year ${evalYears}`);
        airData.push(totalAirCapEx + (airOpExPerYear * evalYears));
        liqData.push(totalLiqCapEx + (liqOpExPerYear * evalYears));
    }

    const finalAirCost = totalAirCapEx + (airOpExPerYear * evalYears);
    const finalLiqCost = totalLiqCapEx + (liqOpExPerYear * evalYears);
    const totalSavings = finalAirCost - finalLiqCost;
    const beYearRaw = (totalLiqCapEx - totalAirCapEx) / (airOpExPerYear - liqOpExPerYear);

    const isAirWinner = totalSavings <= 0;
    const absSavings = Math.abs(totalSavings);

    const textSavingsTitle = currentLang === 'zh' 
        ? `${evalYears}年採用最佳方案(${isAirWinner ? '氣冷' : '液冷'})可省下` 
        : `${evalYears}-Year Savings w/ Best Option (${isAirWinner ? 'Air' : 'Liquid'})`;
    document.getElementById('t-savings-title').innerText = textSavingsTitle;

    document.getElementById('savings').innerText = "+$" + absSavings.toLocaleString(undefined, {maximumFractionDigits: 0});
    if (isAirWinner) {
        document.getElementById('savings').className = "text-sm md:text-xl font-bold text-blue-600 dark:text-blue-400 mt-1";
    } else {
        document.getElementById('savings').className = "text-sm md:text-xl font-bold text-red-600 dark:text-red-400 mt-1";
    }

    if (beYearRaw > 0 && beYearRaw !== Infinity) {
        document.getElementById('breakeven').innerText = beYearRaw.toFixed(1) + "Y";
    } else {
        document.getElementById('breakeven').innerText = "N/A";
    }

    const textChartTitle = currentLang === 'zh' ? `${evalYears} 年 TCO 累積成本比較 (CapEx + OpEx)` : `${evalYears}-Year TCO Comparison (CapEx + OpEx)`;
    document.getElementById('t-chart-title').innerText = textChartTitle;

    let winnerStr = kwPerRack < 40 ? "air" : "liquid";

    let gaugeColor, gaugeStatusText;
    const warningBanner = document.getElementById('gaugeWarningBanner');
    
    if (kwPerRack < 40) {
        gaugeColor = '#22c55e'; 
        gaugeStatusText = currentLang === 'zh' ? '傳統氣冷 (Air Cooling)' : 'Air Cooling';
        warningBanner.classList.add('hidden');
    } else if (kwPerRack <= 80) {
        gaugeColor = '#eab308'; 
        gaugeStatusText = currentLang === 'zh' ? '氣冷極限 (RDHX)' : 'Air Limit (RDHX)';
        warningBanner.classList.add('hidden');
    } else {
        gaugeColor = '#ef4444'; 
        gaugeStatusText = currentLang === 'zh' ? '強制液冷 (DLC)' : 'Must use DLC';
        warningBanner.classList.remove('hidden'); 
    }

    document.getElementById('gaugeValueText').innerText = kwPerRack.toFixed(1) + " kW";
    document.getElementById('gaugeValueText').style.color = gaugeColor;
    document.getElementById('gaugeStatusText').innerText = gaugeStatusText;
    document.getElementById('gaugeStatusText').style.color = gaugeColor;

    latestCalcData = {
        evalYears, utilRate, totalServers, totalRacks, totalKw, powerCost, airPUE, liqPUE, kwPerRack,
        airCapExPerRack, liqCapExPerRack, totalAirCapEx, totalLiqCapEx,
        airOpExPerYear, liqOpExPerYear, labelsCount: labels.length,
        breakevenYear: beYearRaw, totalSavings, winnerStr, gaugeColor, gaugeStatusText,
        labels, airData, liqData 
    };

    drawChart(labels, airData, liqData);
    drawGaugeChart(kwPerRack, gaugeColor); 
}

function drawGaugeChart(kwPerRack, color, isPrintMode = false) {
    const ctx = document.getElementById('gaugeChart').getContext('2d');
    const isDark = document.documentElement.classList.contains('dark');
    const bgColor = isPrintMode ? '#e2e8f0' : (isDark ? '#374151' : '#e5e7eb'); 
    
    const maxKw = 140;
    const currentVal = Math.min(kwPerRack, maxKw);
    const remainVal = Math.max(maxKw - currentVal, 0);

    if (gaugeChartInstance) gaugeChartInstance.destroy();

    gaugeChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Current kW', 'Remaining'],
            datasets: [{
                data: [currentVal, remainVal],
                backgroundColor: [color, bgColor],
                borderWidth: 0,
                circumference: 180, 
                rotation: 270       
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%', 
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false } 
            },
            animation: isPrintMode ? false : {
                animateScale: true,
                animateRotate: true
            }
        }
    });
}

function renderReportFromData(data) {
    document.getElementById('reportContentPitch').innerText = data.pitch;
    document.getElementById('reportContentObj').innerText = data.obj;
    document.getElementById('reportContentROI').innerText = data.roi;
}

function generateSalesReport() {
    const section = document.getElementById('salesReportSection');
    const outdated = document.getElementById('reportStateOutdated');
    const loading = document.getElementById('reportStateLoading');
    const error = document.getElementById('reportStateError');
    const success = document.getElementById('reportStateSuccess');

    section.classList.remove('hidden');
    outdated.classList.add('hidden');

    if (reportCache[currentLang]) {
        renderReportFromData(reportCache[currentLang]);
        loading.classList.add('hidden');
        error.classList.add('hidden');
        success.classList.remove('hidden');
        isReportGenerated = true;
        return;
    }

    error.classList.add('hidden');
    success.classList.add('hidden');
    loading.classList.remove('hidden');
    
    setTimeout(() => {
        try {
            const d = latestCalcData;
            let pitch, obj, roi;

            if (d.winnerStr === "air") {
                pitch = currentLang === 'zh' 
                    ? `客戶您好，根據您 ${d.totalKw}kW 的總運算需求，我們強烈建議採用成熟的「傳統氣冷方案」。這不僅能確保與您現有機房設施 100% 相容，更省下了龐大的液冷硬體建置溢價。` 
                    : `Based on your ${d.totalKw}kW requirement, we recommend the Air Cooling solution. It ensures 100% compatibility with your existing facilities and avoids the hefty premium of liquid cooling hardware.`;
                
                obj = currentLang === 'zh'
                    ? `若客戶詢問：「現在不都改用液冷了嗎？」\n👉 回覆策略：液冷是趨勢，但在單櫃功耗 ${d.kwPerRack.toFixed(1)}kW 的配置下，密度不足以彌補初期 CapEx 的巨大差異。氣冷是目前 ROI 最高的選擇。`
                    : `If client asks: "Isn't liquid the future?"\n👉 Strategy: It is, but at ${d.kwPerRack.toFixed(1)}kW per rack, the density doesn't justify the initial CapEx. Air cooling currently offers the best ROI.`;
            } else {
                const beText = (d.breakevenYear > 0 && d.breakevenYear <= d.evalYears) ? d.breakevenYear.toFixed(1) : ">" + d.evalYears;
                pitch = currentLang === 'zh'
                    ? `客戶您好，您的高密度算力需求（單櫃 ${d.kwPerRack.toFixed(1)}kW）已逼近氣冷解熱極限。導入「直接液冷 (DLC) 方案」，PUE 可由 ${d.airPUE} 降至 ${d.liqPUE}，讓您的晶片滿血運作不降頻。`
                    : `With a high density of ${d.kwPerRack.toFixed(1)}kW/rack, you're approaching the limit of air cooling. Adopting DLC drops your PUE from ${d.airPUE} to ${d.liqPUE}, ensuring your GPUs run without thermal throttling.`;
                
                obj = currentLang === 'zh'
                    ? `若客戶嫌貴：「初期建置要多花幾千萬太貴了。」\n👉 回覆策略：沒錯，但液冷每年能為您省下龐大電費！這筆投資預計在第 ${beText} 年就會達到黃金交叉回本，之後每年都是淨賺。`
                    : `If client objects: "The upfront cost is too high."\n👉 Strategy: True, but it saves massive electricity bills annually. You will break even in Year ${beText}, after which every year is pure profit.`;
            }

            roi = currentLang === 'zh'
                ? `▪️ 評估期：${d.evalYears} 年\n▪️ 預設稼動率：${d.utilRate * 100}%\n▪️ 累積 ${d.evalYears} 年，最佳方案預計可節省總額：$${Math.abs(d.totalSavings).toLocaleString(undefined, {maximumFractionDigits: 0})} USD`
                : `▪️ Eval Period: ${d.evalYears} Years\n▪️ Utilization: ${d.utilRate * 100}%\n▪️ Over ${d.evalYears} years, the best solution saves you: $${Math.abs(d.totalSavings).toLocaleString(undefined, {maximumFractionDigits: 0})} USD`;

            const generatedData = { pitch, obj, roi };
            reportCache[currentLang] = generatedData;
            renderReportFromData(generatedData);

            loading.classList.add('hidden');
            success.classList.remove('hidden');
            isReportGenerated = true;

        } catch (e) {
            loading.classList.add('hidden');
            error.classList.remove('hidden');
            console.error("Report Generation Failed:", e);
        }
    }, 800);
}

function openDrilldownModal(dataIndex, labelStr) {
    const modal = document.getElementById('drilldownModal');
    const d = latestCalcData;
    
    let actualYear = dataIndex; 
    if (dataIndex === d.labelsCount - 1 && d.evalYears % 1 !== 0) { actualYear = d.evalYears; }
    
    const titlePrefix = currentLang === 'zh' ? '成本結構拆解：' : 'Cost Breakdown: ';
    document.getElementById('modalYearLabel').innerText = titlePrefix + labelStr;
    
    const airOpex = d.airOpExPerYear * actualYear; 
    const airTotal = d.totalAirCapEx + airOpex;
    document.getElementById('airCapexDetail').innerText = `${d.totalRacks} Racks × $${d.airCapExPerRack.toLocaleString()}`;
    
    if (actualYear === 0) {
        document.getElementById('airOpexDetail').innerText = currentLang === 'zh' ? "建置初期，尚無營運電費產生。" : "No OpEx in Year 0.";
    } else {
        document.getElementById('airOpexDetail').innerHTML = currentLang === 'zh' 
            ? `總功耗 ${d.totalKw}kW × <b>PUE ${d.airPUE}</b><br>× 稼動率 ${d.utilRate*100}% × 8760hrs<br>× $${d.powerCost}/kWh × <b>${actualYear}年</b>`
            : `Total Pwr ${d.totalKw}kW × <b>PUE ${d.airPUE}</b><br>× Util. ${d.utilRate*100}% × 8760hrs<br>× $${d.powerCost}/kWh × <b>${actualYear} Yrs</b>`;
    }
    document.getElementById('airTotalDetail').innerText = "$" + airTotal.toLocaleString(undefined, {maximumFractionDigits: 0});
    
    const liqOpex = d.liqOpExPerYear * actualYear; 
    const liqTotal = d.totalLiqCapEx + liqOpex;
    document.getElementById('liqCapexDetail').innerText = `${d.totalRacks} Racks × $${d.liqCapExPerRack.toLocaleString()}`;
    
    if (actualYear === 0) {
        document.getElementById('liqOpexDetail').innerText = currentLang === 'zh' ? "建置初期，尚無營運電費產生。" : "No OpEx in Year 0.";
    } else {
        document.getElementById('liqOpexDetail').innerHTML = currentLang === 'zh'
            ? `總功耗 ${d.totalKw}kW × <b>PUE ${d.liqPUE}</b><br>× 稼動率 ${d.utilRate*100}% × 8760hrs<br>× $${d.powerCost}/kWh × <b>${actualYear}年</b>`
            : `Total Pwr ${d.totalKw}kW × <b>PUE ${d.liqPUE}</b><br>× Util. ${d.utilRate*100}% × 8760hrs<br>× $${d.powerCost}/kWh × <b>${actualYear} Yrs</b>`;
    }
    document.getElementById('liqTotalDetail').innerText = "$" + liqTotal.toLocaleString(undefined, {maximumFractionDigits: 0});
    
    const diff = Math.abs(airTotal - liqTotal); 
    let winnerText = "";
    if (airTotal < liqTotal) {
        winnerText = currentLang === 'zh' ? `🏆 氣冷勝出 (節省 $${diff.toLocaleString(undefined, {maximumFractionDigits: 0})})` : `🏆 Air Wins (Save $${diff.toLocaleString(undefined, {maximumFractionDigits: 0})})`;
        document.getElementById('modalDiff').className = "bg-blue-100 dark:bg-blue-900/40 p-4 text-center text-lg font-bold text-blue-800 dark:text-blue-300 border-t border-blue-200 dark:border-blue-800";
    } else if (liqTotal < airTotal) {
        winnerText = currentLang === 'zh' ? `🏆 液冷勝出 (節省 $${diff.toLocaleString(undefined, {maximumFractionDigits: 0})})` : `🏆 Liquid Wins (Save $${diff.toLocaleString(undefined, {maximumFractionDigits: 0})})`;
        document.getElementById('modalDiff').className = "bg-red-100 dark:bg-red-900/40 p-4 text-center text-lg font-bold text-red-800 dark:text-red-300 border-t border-red-200 dark:border-red-800";
    } else {
        winnerText = currentLang === 'zh' ? "⚖️ 成本平手" : "⚖️ Break-even Point";
        document.getElementById('modalDiff').className = "bg-gray-100 dark:bg-gray-900 p-4 text-center text-lg font-bold text-gray-800 dark:text-gray-100 border-t dark:border-gray-700";
    }
    document.getElementById('modalDiff').innerText = winnerText;
    document.getElementById('drilldownModal').classList.remove('hidden');
}

function drawChart(labels, airData, liqData, isPrintMode = false) {
    const ctx = document.getElementById('tcoChart').getContext('2d');
    const isDark = document.documentElement.classList.contains('dark');
    
    const textColor = isPrintMode ? '#0f172a' : (isDark ? '#e5e7eb' : '#374151');
    const gridColor = isPrintMode ? '#e2e8f0' : (isDark ? '#374151' : '#e5e7eb');
    
    const labelAir = currentLang === 'zh' ? '氣冷累積成本 (Air)' : 'Air Cooling TCO';
    const labelLiq = currentLang === 'zh' ? '液冷累積成本 (Liquid)' : 'Liquid Cooling TCO';

    if (tcoChartInstance) tcoChartInstance.destroy();
    
    tcoChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: labelAir, data: airData, borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.1, pointHoverRadius: 8, pointHitRadius: 10 },
                { label: labelLiq, data: liqData, borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', fill: true, tension: 0.1, pointHoverRadius: 8, pointHitRadius: 10 }
            ]
        },
        options: { 
            responsive: true, maintainAspectRatio: false,
            animation: isPrintMode ? false : true,
            onClick: (event) => {
                if (isPrintMode) return;
                const points = tcoChartInstance.getElementsAtEventForMode(event, 'index', { intersect: false }, true);
                if (points.length) {
                    const dataIndex = points[0].index;
                    const labelStr = labels[dataIndex];
                    openDrilldownModal(dataIndex, labelStr);
                }
            },
            interaction: { mode: 'index', intersect: false },
            plugins: { legend: { labels: { color: textColor } }, tooltip: { enabled: !isPrintMode, bodyFont: { size: 14 } } },
            scales: { 
                x: { ticks: { color: textColor }, grid: { color: gridColor } },
                y: { ticks: { color: textColor }, grid: { color: gridColor }, title: { display: true, text: 'USD ($)', color: textColor } } 
            } 
        }
    });
}

function openExportModal() {
    const chipSelect = document.getElementById('chipType');
    const chipName = chipSelect.options[chipSelect.selectedIndex].text;
    const chipKey = chipName.match(/[a-zA-Z0-9]+/g)?.[1] || 'Chip';
    const d = latestCalcData;
    
    const defaultFilename = `TCO_Report_${chipKey}_${d.totalServers}Nodes`;
    document.getElementById('exportFilename').value = defaultFilename;
    
    document.getElementById('exportModal').classList.remove('hidden');
    document.getElementById('exportFilename').focus();
}

function closeExportModal() {
    document.getElementById('exportModal').classList.add('hidden');
}

// 🚀 執行 PDF 匯出：包含全面 i18n 翻譯與強制 A4 產出
async function executePDFExport() {
    const btn = document.getElementById('btn-confirm-export');
    const originalHtml = btn.innerHTML;
    const isZh = currentLang === 'zh';
    
    let userFilename = document.getElementById('exportFilename').value.trim();
    if (!userFilename) { userFilename = "TCO_Report"; }
    
    btn.innerHTML = `⏳ <span class="ml-1">${isZh ? '產出中...' : 'Generating...'}</span>`;
    btn.disabled = true;

    try {
        if (!window.jspdf || !window.html2canvas) {
            alert(isZh ? "PDF 套件載入中，請稍後再試。" : "PDF libraries loading, please try again.");
            return;
        }

        const d = latestCalcData;
        const chipSelect = document.getElementById('chipType');
        const chipName = chipSelect.options[chipSelect.selectedIndex].text;

        // 1. 全面雙語化翻譯 (i18n for PDF Elements)
        document.getElementById('pdfMainTitle').innerText = isZh ? 'AI 伺服器 TCO 分析報告' : 'AI Server TCO Analysis Report';
        document.getElementById('pdfDate').innerText = (isZh ? '報告生成日期：' : 'Generated on: ') + new Date().toLocaleDateString();
        document.getElementById('pdfSubtitle').innerText = isZh ? '由 TCO 運算引擎 V2 產生' : 'Generated by TCO Engine V2';
        document.getElementById('pdfParamsTitle').innerHTML = isZh ? '⚙️ 基礎與進階參數設定' : '⚙️ Configuration Parameters';
        document.getElementById('pdfChartsTitle').innerHTML = isZh ? '📊 TCO 與散熱轉折視覺化' : '📊 Visualizations (Gauge & Trend)';
        document.getElementById('pdfPitchTitle').innerHTML = isZh ? '💡 AI 業務提案教戰手冊' : '💡 AI Sales Battlecard';
        document.getElementById('pdfElevatorTitle').innerHTML = isZh ? '🎯 核心說帖' : '🎯 Elevator Pitch';
        document.getElementById('pdfObjectionTitle').innerHTML = isZh ? '🛡️ 反對意見克服' : '🛡️ Objection Handling';
        document.getElementById('pdfCopyright').innerText = isZh ? '版權所有 © 2026 Bryan Jhuang. 專為 AI 伺服器 PM 概念驗證設計。' : 'Copyright © 2026 Bryan Jhuang. Designed for AI Server PM PoC.';
        document.getElementById('pdfDashboardLinkText').innerText = isZh ? '完整互動式儀表板請見：' : 'Interactive Dashboard available at:';

        // 2. 參數表 (水平橫向微縮排版)
        document.getElementById('pdfParams').innerHTML = `
            <div class="flex flex-col border-b border-gray-100 pb-1"><span class="text-slate-500 font-medium">${isZh ? 'AI 伺服器型號' : 'Chip Model'}</span> <b class="text-slate-800">${chipName}</b></div>
            <div class="flex flex-col border-b border-gray-100 pb-1"><span class="text-slate-500 font-medium">${isZh ? '總伺服器數量' : 'Total Servers'}</span> <b class="text-slate-800">${d.totalServers} Nodes</b></div>
            <div class="flex flex-col border-b border-gray-100 pb-1"><span class="text-slate-500 font-medium">${isZh ? '單機櫃節點數' : 'Nodes per Rack'}</span> <b class="text-slate-800">${d.kwPerRack / (parseFloat(chipSelect.value))} Nodes</b></div>
            <div class="flex flex-col border-b border-gray-100 pb-1"><span class="text-slate-500 font-medium">${isZh ? '單機櫃功耗' : 'Power per Rack'}</span> <b class="text-red-500">${d.kwPerRack.toFixed(1)} kW</b></div>
            <div class="flex flex-col"><span class="text-slate-500 font-medium">${isZh ? '電費費率' : 'Power Rate'}</span> <b class="text-slate-800">$${d.powerCost}/kWh</b></div>
            <div class="flex flex-col"><span class="text-slate-500 font-medium">${isZh ? '評估年限' : 'Eval Years'}</span> <b class="text-slate-800">${d.evalYears} Yrs</b></div>
            <div class="flex flex-col"><span class="text-slate-500 font-medium">${isZh ? '氣冷 PUE' : 'Air PUE'}</span> <b class="text-slate-800">${d.airPUE}</b></div>
            <div class="flex flex-col"><span class="text-slate-500 font-medium">${isZh ? '液冷 PUE' : 'Liquid PUE'}</span> <b class="text-slate-800">${d.liqPUE}</b></div>
        `;

        // 3. 贏家計分板 (置中橫向)
        const isAirWinner = d.totalSavings <= 0;
        const bestOpt = isAirWinner ? (isZh ? '傳統氣冷方案 (Air)' : 'Air Cooling') : (isZh ? '強制液冷方案 (Liquid)' : 'Liquid Cooling');
        const winnerColor = isAirWinner ? 'text-blue-600' : 'text-red-600';
        
        document.getElementById('pdfWinnerBoard').innerHTML = `
            <div class="text-center border-r border-indigo-100 pr-8">
                <h3 class="text-sm font-bold text-indigo-900 tracking-wide">${isZh ? '👑 最佳 TCO 散熱方案' : '👑 Best TCO Solution'}</h3>
                <p class="text-2xl font-black mt-1 ${winnerColor}">${bestOpt}</p>
            </div>
            <div class="text-center border-r border-indigo-100 px-8">
                <p class="text-xs text-slate-500 uppercase tracking-wider font-bold">${isZh ? '5年總節省成本' : 'Total Savings'}</p>
                <p class="text-2xl font-black text-green-600 mt-1">+$${Math.abs(d.totalSavings).toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            </div>
            <div class="text-center pl-8">
                <p class="text-xs text-slate-500 uppercase tracking-wider font-bold">${isZh ? '黃金交叉回本點' : 'Breakeven Point'}</p>
                <p class="text-2xl font-black text-purple-600 mt-1">${d.breakevenYear > 0 && d.breakevenYear !== Infinity ? d.breakevenYear.toFixed(1) + ' Yrs' : 'N/A'}</p>
            </div>
        `;

        document.getElementById('pdfGaugeValueText').innerText = d.kwPerRack.toFixed(1) + " kW";
        document.getElementById('pdfGaugeValueText').style.color = d.gaugeColor;
        document.getElementById('pdfGaugeStatusText').innerText = d.gaugeStatusText;
        document.getElementById('pdfGaugeStatusText').style.color = d.gaugeColor;

        // 執行無痕重建法擷取圖表
        drawGaugeChart(d.kwPerRack, d.gaugeColor, true);
        drawChart(d.labels, d.airData, d.liqData, true);
        await new Promise(r => setTimeout(r, 150));
        document.getElementById('pdfGaugeImg').src = gaugeChartInstance.toBase64Image();
        document.getElementById('pdfLineImg').src = tcoChartInstance.toBase64Image();
        drawGaugeChart(d.kwPerRack, d.gaugeColor, false);
        drawChart(d.labels, d.airData, d.liqData, false);

        // 4. 處理 AI 提案區塊
        const pitchText = document.getElementById('pdfPitchText');
        const objText = document.getElementById('pdfObjText');
        const noReportMsg = document.getElementById('pdfNoReportMsg');
        
        if (isReportGenerated && reportCache[currentLang]) {
            pitchText.innerText = reportCache[currentLang].pitch;
            objText.innerText = reportCache[currentLang].obj;
            pitchText.parentElement.classList.remove('hidden');
            objText.parentElement.classList.remove('hidden');
            noReportMsg.classList.add('hidden');
        } else {
            // 未產生報告時的防呆顯示
            pitchText.parentElement.classList.add('hidden');
            objText.parentElement.classList.add('hidden');
            noReportMsg.innerText = isZh ? '(尚未生成業務教戰手冊，請於系統中點擊產出)' : '(Sales report not generated. Please generate it in the dashboard.)';
            noReportMsg.classList.remove('hidden');
        }

        const urlObj = new URL(window.location.href);
        urlObj.searchParams.set('tab', 'tco'); 
        document.getElementById('pdfUrl').innerText = urlObj.toString();
        document.getElementById('pdfUrl').href = urlObj.toString();

        // 5. 轉換為 Canvas
        const targetEl = document.getElementById('pdfTemplate');
        const canvas = await html2canvas(targetEl, { 
            scale: 2, 
            useCORS: true,
            backgroundColor: '#f8fafc' 
        });
        const imgData = canvas.toDataURL('image/png');
        
        // 🚀 6. 強制 A4 標準列印 (210mm x 297mm)
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
        const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${userFilename}.pdf`);

        closeExportModal();

    } catch (err) {
        console.error("PDF Export Error:", err);
        alert(isZh ? '匯出失敗，請檢查瀏覽器設定。' : 'Export failed, check console for details.');
    } finally {
        btn.innerHTML = originalHtml;
        btn.disabled = false;
    }
}
