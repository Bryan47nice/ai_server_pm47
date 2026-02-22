// ==========================================
// TCO Calculation Engine & Sales Report State
// ==========================================

let tcoChartInstance = null;
let latestCalcData = {}; 

// 🚀 Sales Report 狀態機變數
let isReportGenerated = false;

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

    // 🚀 當參數變更且報告已產生時，觸發 Outdated 狀態 (Dirty State)
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

    const textSavingsTitle = currentLang === 'zh' ? `${evalYears}年總節省成本 (USD)` : `${evalYears}-Year TCO Savings (USD)`;
    const textChartTitle = currentLang === 'zh' ? `${evalYears} 年 TCO 累積成本比較 (CapEx + OpEx)` : `${evalYears}-Year TCO Comparison (CapEx + OpEx)`;
    document.getElementById('t-savings-title').innerText = textSavingsTitle;
    document.getElementById('t-chart-title').innerText = textChartTitle;

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

    if (totalSavings > 0) {
        document.getElementById('savings').innerText = "+$" + totalSavings.toLocaleString(undefined, {maximumFractionDigits: 0});
        document.getElementById('savings').className = "text-lg md:text-xl font-bold text-green-600 dark:text-green-400 mt-1";
        document.getElementById('breakeven').innerText = beYearRaw > evalYears ? "N/A" : beYearRaw.toFixed(1) + "Y";
    } else {
        document.getElementById('savings').innerText = "-$" + Math.abs(totalSavings).toLocaleString(undefined, {maximumFractionDigits: 0});
        document.getElementById('savings').className = "text-lg md:text-xl font-bold text-red-600 dark:text-red-400 mt-1";
        document.getElementById('breakeven').innerText = "N/A";
    }

    let winnerStr = kwPerRack < 30 ? "air" : "liquid";

    const recEl = document.getElementById('recommendation');
    if (kwPerRack < 30) { 
        recEl.innerText = currentLang === 'zh' ? "氣冷方案" : "Air Cooling"; 
        recEl.className = "text-lg md:text-xl font-bold text-green-600 dark:text-green-400 mt-1"; 
    } else if (kwPerRack <= 50) {
        recEl.innerText = currentLang === 'zh' ? "評估液冷" : "Evaluate DLC"; 
        recEl.className = "text-lg md:text-xl font-bold text-yellow-600 dark:text-yellow-400 mt-1";
    } else { 
        recEl.innerText = currentLang === 'zh' ? "液冷方案" : "Liquid Cooling"; 
        recEl.className = "text-lg md:text-xl font-bold text-red-600 dark:text-red-400 mt-1"; 
    }

    latestCalcData = {
        evalYears, utilRate, totalRacks, totalKw, powerCost, airPUE, liqPUE, kwPerRack,
        airCapExPerRack, liqCapExPerRack, totalAirCapEx, totalLiqCapEx,
        airOpExPerYear, liqOpExPerYear, labelsCount: labels.length,
        breakevenYear: beYearRaw, totalSavings, winnerStr
    };

    drawChart(labels, airData, liqData);
}

// 🚀 生成業務教戰報告邏輯
function generateSalesReport() {
    const section = document.getElementById('salesReportSection');
    const outdated = document.getElementById('reportStateOutdated');
    const loading = document.getElementById('reportStateLoading');
    const error = document.getElementById('reportStateError');
    const success = document.getElementById('reportStateSuccess');

    // 切換 UI 狀態至 Loading
    section.classList.remove('hidden');
    outdated.classList.add('hidden');
    error.classList.add('hidden');
    success.classList.add('hidden');
    loading.classList.remove('hidden');
    
    // 模擬 AI 生成時間 (延遲 800ms)
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

            document.getElementById('reportContentPitch').innerText = pitch;
            document.getElementById('reportContentObj').innerText = obj;
            document.getElementById('reportContentROI').innerText = roi;

            // 切換至 Success
            loading.classList.add('hidden');
            success.classList.remove('hidden');
            isReportGenerated = true;

        } catch (e) {
            // 切換至 Error
            loading.classList.add('hidden');
            error.classList.remove('hidden');
            console.error("Report Generation Failed:", e);
        }
    }, 800);
}

// 供多語系切換時重新渲染
function forceRegenerateReport() {
    if (isReportGenerated) generateSalesReport();
}

// ==========================================
// 以下保留 Drilldown Modal 及 drawChart 邏輯
// ==========================================
function openDrilldownModal(dataIndex, labelStr) {
    const modal = document.getElementById('drilldownModal');
    const d = latestCalcData;
    
    let actualYear = dataIndex; 
    if (dataIndex === d.labelsCount - 1 && d.evalYears % 1 !== 0) { actualYear = d.evalYears; }
    
    const titlePrefix = currentLang === 'zh' ? '成本結構拆解：' : 'Cost Breakdown: ';
    document.getElementById('modalYearLabel').innerText = titlePrefix + labelStr;
    
    const airOpex = d.airOpExPerYear * actualYear; const airTotal = d.totalAirCapEx + airOpex;
    document.getElementById('airCapexDetail').innerText = `${d.totalRacks} Racks × $${d.airCapExPerRack.toLocaleString()}`;
    if (actualYear === 0) {
        document.getElementById('airOpexDetail').innerText = currentLang === 'zh' ? "建置初期，尚無營運電費產生。" : "No OpEx in Year 0.";
    } else {
        document.getElementById('airOpexDetail').innerHTML = `總功耗 ${d.totalKw}kW × <b>PUE ${d.airPUE}</b><br>× 稼動率 ${d.utilRate*100}% × 8760hrs<br>× $${d.powerCost}/kWh × <b>${actualYear}年</b>`;
    }
    document.getElementById('airTotalDetail').innerText = "$" + airTotal.toLocaleString(undefined, {maximumFractionDigits: 0});
    
    const liqOpex = d.liqOpExPerYear * actualYear; const liqTotal = d.totalLiqCapEx + liqOpex;
    document.getElementById('liqCapexDetail').innerText = `${d.totalRacks} Racks × $${d.liqCapExPerRack.toLocaleString()}`;
    if (actualYear === 0) {
        document.getElementById('liqOpexDetail').innerText = currentLang === 'zh' ? "建置初期，尚無營運電費產生。" : "No OpEx in Year 0.";
    } else {
        document.getElementById('liqOpexDetail').innerHTML = `總功耗 ${d.totalKw}kW × <b>PUE ${d.liqPUE}</b><br>× 稼動率 ${d.utilRate*100}% × 8760hrs<br>× $${d.powerCost}/kWh × <b>${actualYear}年</b>`;
    }
    document.getElementById('liqTotalDetail').innerText = "$" + liqTotal.toLocaleString(undefined, {maximumFractionDigits: 0});
    
    const diff = Math.abs(airTotal - liqTotal); let winnerText = "";
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

function drawChart(labels, airData, liqData) {
    const ctx = document.getElementById('tcoChart').getContext('2d');
    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#e5e7eb' : '#374151';
    
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
            onClick: (event) => {
                const points = tcoChartInstance.getElementsAtEventForMode(event, 'index', { intersect: false }, true);
                if (points.length) {
                    const dataIndex = points[0].index;
                    const labelStr = labels[dataIndex];
                    openDrilldownModal(dataIndex, labelStr);
                }
            },
            interaction: { mode: 'index', intersect: false },
            plugins: { legend: { labels: { color: textColor } }, tooltip: { bodyFont: { size: 14 } } },
            scales: { 
                x: { ticks: { color: textColor } },
                y: { ticks: { color: textColor }, title: { display: true, text: 'USD ($)', color: textColor } } 
            } 
        }
    });
}
