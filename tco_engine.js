// ==========================================
// TCO Calculation Engine & Chart Controller
// ==========================================

let tcoChartInstance = null;

function calculateTCO() {
    // 1. 取得使用者輸入參數
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

    // 2. 基礎物理與 CapEx 運算
    const kwPerRack = serversPerRack * chipPower;
    const totalRacks = Math.ceil(totalServers / serversPerRack);
    document.getElementById('kwPerRack').innerText = kwPerRack.toFixed(1);
    document.getElementById('totalRacksDisplay').innerText = totalRacks;

    const totalAirCapEx = totalRacks * airCapExPerRack;
    const totalLiqCapEx = totalRacks * liqCapExPerRack;
    document.getElementById('airTotalCapexDisplay').innerText = totalAirCapEx.toLocaleString();
    document.getElementById('liqTotalCapexDisplay').innerText = totalLiqCapEx.toLocaleString();

    // 3. OpEx 耗電量運算 (包含稼動率)
    const totalKw = totalServers * chipPower;
    const hoursPerYear = 8760;
    const airOpExPerYear = totalKw * airPUE * utilRate * hoursPerYear * powerCost;
    const liqOpExPerYear = totalKw * liqPUE * utilRate * hoursPerYear * powerCost;

    // 4. 動態標題處理 (結合多語系狀態 currentLang，由 index.html 管理)
    const textSavingsTitle = currentLang === 'zh' ? `${evalYears}年總節省成本 (USD)` : `${evalYears}-Year TCO Savings (USD)`;
    const textChartTitle = currentLang === 'zh' ? `${evalYears} 年 TCO 累積成本比較 (CapEx + OpEx)` : `${evalYears}-Year TCO Comparison (CapEx + OpEx)`;
    document.getElementById('t-savings-title').innerText = textSavingsTitle;
    document.getElementById('t-chart-title').innerText = textChartTitle;

    // 5. 準備繪圖資料陣列
    let airData = []; let liqData = []; let labels = [];
    const maxIntYear = Math.floor(evalYears);

    for (let i = 0; i <= maxIntYear; i++) {
        labels.push(i === 0 ? (currentLang === 'zh' ? 'Y0' : 'Y0') : `Y${i}`);
        airData.push(totalAirCapEx + (airOpExPerYear * i));
        liqData.push(totalLiqCapEx + (liqOpExPerYear * i));
    }
    // 處理小數點年限
    if (evalYears % 1 !== 0) {
        labels.push(`Y${evalYears}`);
        airData.push(totalAirCapEx + (airOpExPerYear * evalYears));
        liqData.push(totalLiqCapEx + (liqOpExPerYear * evalYears));
    }

    // 6. 財務結算與黃金交叉點 (Break-even)
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

    // 7. 系統推薦引擎
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

    // 8. 呼叫圖表渲染
    drawChart(labels, airData, liqData);
}

function drawChart(labels, airData, liqData) {
    const ctx = document.getElementById('tcoChart').getContext('2d');
    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#e5e7eb' : '#374151';
    
    if (tcoChartInstance) tcoChartInstance.destroy();
    
    tcoChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: 'Air TCO', data: airData, borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.1 },
                { label: 'Liquid TCO', data: liqData, borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', fill: true, tension: 0.1 }
            ]
        },
        options: { 
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: textColor } } },
            scales: { 
                x: { ticks: { color: textColor } },
                y: { ticks: { color: textColor }, title: { display: true, text: 'USD ($)', color: textColor } } 
            } 
        }
    });
}
