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
        breakevenYear: beYearRaw, totalSavings, winnerStr
    };

    drawChart(labels, airData, liqData);
    drawGaugeChart(kwPerRack, gaugeColor); 
}

function drawGaugeChart(kwPerRack, color) {
    const ctx = document.getElementById('gaugeChart').getContext('2d');
    const isDark = document.documentElement.classList.contains('dark');
    const bgColor = isDark ? '#374151' : '#e5e7eb'; 
    
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
            animation: {
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

// 🚀 完整升級版：動態高度與提案注入的 PDF 引擎
async function exportToPDF() {
    const btn = document.getElementById('btn-export-pdf');
    const originalHtml = btn.innerHTML;
    const isZh = currentLang === 'zh';
    
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

        // 1. 填充基礎資訊 (Header & Params)
        document.getElementById('pdfMainTitle').innerText = isZh ? 'AI 伺服器 TCO 分析報告' : 'AI Server TCO Analysis Report';
        document.getElementById('pdfDate').innerText = (isZh ? '報告生成日期：' : 'Generated on: ') + new Date().toLocaleDateString();
        
        document.getElementById('pdfParams').innerHTML = `
            <div class="flex justify-between border-b border-gray-100 pb-1.5"><span class="text-slate-500">${isZh ? 'AI 伺服器型號' : 'Chip Model'}</span> <b class="text-slate-800">${chipName}</b></div>
            <div class="flex justify-between border-b border-gray-100 pb-1.5"><span class="text-slate-500">${isZh ? '總伺服器數量' : 'Total Servers'}</span> <b class="text-slate-800">${d.totalServers} Nodes</b></div>
            <div class="flex justify-between border-b border-gray-100 pb-1.5"><span class="text-slate-500">${isZh ? '電費費率' : 'Power Rate'}</span> <b class="text-slate-800">$${d.powerCost}/kWh</b></div>
            <div class="flex justify-between border-b border-gray-100 pb-1.5"><span class="text-slate-500">${isZh ? '評估年限' : 'Eval Years'}</span> <b class="text-slate-800">${d.evalYears} Yrs</b></div>
            <div class="flex justify-between border-b border-gray-100 pb-1.5"><span class="text-slate-500">${isZh ? '氣冷 PUE' : 'Air PUE'}</span> <b class="text-slate-800">${d.airPUE}</b></div>
            <div class="flex justify-between"><span class="text-slate-500">${isZh ? '液冷 PUE' : 'Liquid PUE'}</span> <b class="text-slate-800">${d.liqPUE}</b></div>
        `;

        // 2. 贏家計分板 (加上皇冠與對比色)
        const isAirWinner = d.totalSavings <= 0;
        const bestOpt = isAirWinner ? (isZh ? '傳統氣冷方案 (Air)' : 'Air Cooling') : (isZh ? '強制液冷方案 (Liquid)' : 'Liquid Cooling');
        const winnerColor = isAirWinner ? 'text-blue-600' : 'text-red-600';
        
        document.getElementById('pdfWinnerBoard').innerHTML = `
            <h3 class="text-lg font-bold text-indigo-900 tracking-wide">${isZh ? '👑 最佳 TCO 散熱方案' : '👑 Best TCO Solution'}</h3>
            <p class="text-2xl font-black mt-2 ${winnerColor}">${bestOpt}</p>
            <div class="mt-5 flex justify-center gap-10 w-full border-t border-indigo-100 pt-4">
                <div>
                    <p class="text-xs text-slate-500 uppercase tracking-wider font-bold">${isZh ? '5年總節省成本' : 'Total Savings'}</p>
                    <p class="text-xl font-black text-green-600 mt-1">+$${Math.abs(d.totalSavings).toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                </div>
                <div>
                    <p class="text-xs text-slate-500 uppercase tracking-wider font-bold">${isZh ? '黃金交叉回本點' : 'Breakeven Point'}</p>
                    <p class="text-xl font-black text-purple-600 mt-1">${d.breakevenYear > 0 && d.breakevenYear !== Infinity ? d.breakevenYear.toFixed(1) + ' Yrs' : 'N/A'}</p>
                </div>
            </div>
        `;

        // 3. 動態注入 AI Sales 提案 (若有的話)
        const pitchSection = document.getElementById('pdfPitchSection');
        if (isReportGenerated && reportCache[currentLang]) {
            pitchSection.classList.remove('hidden');
            document.getElementById('pdfPitchText').innerText = reportCache[currentLang].pitch;
            document.getElementById('pdfObjText').innerText = reportCache[currentLang].obj;
        } else {
            pitchSection.classList.add('hidden');
        }

        // 4. Chart 圖片化
        document.getElementById('pdfGaugeImg').src = gaugeChartInstance.toBase64Image();
        document.getElementById('pdfLineImg').src = tcoChartInstance.toBase64Image();
        
        // 5. URL 連結
        const urlObj = new URL(window.location.href);
        urlObj.searchParams.set('tab', 'tco'); 
        document.getElementById('pdfUrl').innerText = urlObj.toString();
        document.getElementById('pdfUrl').href = urlObj.toString();

        // 6. html2canvas 繪製
        const targetEl = document.getElementById('pdfTemplate');
        const canvas = await html2canvas(targetEl, { 
            scale: 2, 
            useCORS: true,
            backgroundColor: '#f8fafc' // 確保底色完美對應 Tailwind gray-50
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        // 7. 動態長度 Infographic PDF 產生 (非標準 A4)
        const { jsPDF } = window.jspdf;
        const pdfWidth = 210; // 固定寬度對標 A4 寬 (210mm)
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width; // 依照內容高度動態延伸
        
        const pdf = new jsPDF('p', 'mm', [pdfWidth, pdfHeight]);
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        // 下載檔名
        const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
        const chipKey = chipName.match(/[a-zA-Z0-9]+/g)?.[1] || 'Chip';
        const filename = `TCO_Report_${chipKey}_${d.totalServers}nodes_${dateStr}.pdf`;
        
        pdf.save(filename);

    } catch (err) {
        console.error("PDF Export Error:", err);
        alert(isZh ? '匯出失敗，請檢查瀏覽器設定。' : 'Export failed, check console for details.');
    } finally {
        btn.innerHTML = originalHtml;
        btn.disabled = false;
    }
}
