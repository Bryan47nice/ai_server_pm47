// ==========================================
// TCO Calculation Engine & Chart Controller
// ==========================================

let tcoChartInstance = null;
let latestCalcData = {}; // 🚀 用來暫存最新的計算結果給 Modal 使用

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

    // 動態更新 Dashboard 標題
    const textSavingsTitle = currentLang === 'zh' ? `${evalYears}年總節省成本 (USD)` : `${evalYears}-Year TCO Savings (USD)`;
    const textChartTitle = currentLang === 'zh' ? `${evalYears} 年 TCO 累積成本比較 (CapEx + OpEx)` : `${evalYears}-Year TCO Comparison (CapEx + OpEx)`;
    document.getElementById('t-savings-title').innerText = textSavingsTitle;
    document.getElementById('t-chart-title').innerText = textChartTitle;

    let airData = []; let liqData = []; let labels = [];
    const maxIntYear = Math.floor(evalYears);

    for (let i = 0; i <= maxIntYear; i++) {
        // 🚀 圖例在中文時顯示「第 X 年」
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

    if (totalSavings > 0) {
        document.getElementById('savings').innerText = "+$" + totalSavings.toLocaleString(undefined, {maximumFractionDigits: 0});
        document.getElementById('savings').className = "text-lg md:text-xl font-bold text-green-600 dark:text-green-400 mt-1";
        const beYear = (totalLiqCapEx - totalAirCapEx) / (airOpExPerYear - liqOpExPerYear);
        document.getElementById('breakeven').innerText = beYear > evalYears ? "N/A" : beYear.toFixed(1) + "Y";
    } else {
        document.getElementById('savings').innerText = "-$" + Math.abs(totalSavings).toLocaleString(undefined, {maximumFractionDigits: 0});
        document.getElementById('savings').className = "text-lg md:text-xl font-bold text-red-600 dark:text-red-400 mt-1";
        document.getElementById('breakeven').innerText = "N/A";
    }

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

    // 🚀 將資料存入全域變數，供 Modal 讀取
    latestCalcData = {
        evalYears, utilRate, totalRacks, totalKw, powerCost, airPUE, liqPUE,
        airCapExPerRack, liqCapExPerRack, totalAirCapEx, totalLiqCapEx,
        airOpExPerYear, liqOpExPerYear, labelsCount: labels.length
    };

    drawChart(labels, airData, liqData);
}

// 🚀 負責打開下鑽彈窗並渲染算式
function openDrilldownModal(dataIndex, labelStr) {
    const modal = document.getElementById('drilldownModal');
    const d = latestCalcData;
    
    // 判斷當前點擊的是第幾年
    let actualYear = dataIndex; 
    if (dataIndex === d.labelsCount - 1 && d.evalYears % 1 !== 0) {
        actualYear = d.evalYears;
    }
    
    // 更新標題
    const titlePrefix = currentLang === 'zh' ? '成本結構拆解：' : 'Cost Breakdown: ';
    document.getElementById('modalYearLabel').innerText = titlePrefix + labelStr;
    
    // 氣冷算式組裝
    const airOpex = d.airOpExPerYear * actualYear; 
    const airTotal = d.totalAirCapEx + airOpex;
    document.getElementById('airCapexDetail').innerText = `${d.totalRacks} Racks × $${d.airCapExPerRack.toLocaleString()}`;
    if (actualYear === 0) {
        document.getElementById('airOpexDetail').innerText = currentLang === 'zh' ? "建置初期，尚無營運電費產生。" : "No OpEx in Year 0.";
    } else {
        document.getElementById('airOpexDetail').innerHTML = `總功耗 ${d.totalKw}kW × <b>PUE ${d.airPUE}</b><br>× 稼動率 ${d.utilRate*100}% × 8760hrs<br>× $${d.powerCost}/kWh × <b>${actualYear}年</b>`;
    }
    document.getElementById('airTotalDetail').innerText = "$" + airTotal.toLocaleString(undefined, {maximumFractionDigits: 0});
    
    // 液冷算式組裝
    const liqOpex = d.liqOpExPerYear * actualYear; 
    const liqTotal = d.totalLiqCapEx + liqOpex;
    document.getElementById('liqCapexDetail').innerText = `${d.totalRacks} Racks × $${d.liqCapExPerRack.toLocaleString()}`;
    if (actualYear === 0) {
        document.getElementById('liqOpexDetail').innerText = currentLang === 'zh' ? "建置初期，尚無營運電費產生。" : "No OpEx in Year 0.";
    } else {
        document.getElementById('liqOpexDetail').innerHTML = `總功耗 ${d.totalKw}kW × <b>PUE ${d.liqPUE}</b><br>× 稼動率 ${d.utilRate*100}% × 8760hrs<br>× $${d.powerCost}/kWh × <b>${actualYear}年</b>`;
    }
    document.getElementById('liqTotalDetail').innerText = "$" + liqTotal.toLocaleString(undefined, {maximumFractionDigits: 0});
    
    // 結論算式
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

    // 顯示 Modal
    modal.classList.remove('hidden');
}

function drawChart(labels, airData, liqData) {
    const ctx = document.getElementById('tcoChart').getContext('2d');
    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#e5e7eb' : '#374151';
    
    // 🚀 圖表標籤多語系處理
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
            // 🚀 綁定點擊事件，呼叫彈窗
            onClick: (event) => {
                const points = tcoChartInstance.getElementsAtEventForMode(event, 'index', { intersect: false }, true);
                if (points.length) {
                    const dataIndex = points[0].index;
                    const labelStr = labels[dataIndex];
                    openDrilldownModal(dataIndex, labelStr);
                }
            },
            interaction: { mode: 'index', intersect: false }, // 讓游標停在 X 軸上就會顯示 Tooltip
            plugins: { legend: { labels: { color: textColor } }, tooltip: { bodyFont: { size: 14 } } },
            scales: { 
                x: { ticks: { color: textColor } },
                y: { ticks: { color: textColor }, title: { display: true, text: 'USD ($)', color: textColor } } 
            } 
        }
    });
}
