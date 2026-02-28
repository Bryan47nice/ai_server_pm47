// ==========================================
// TCO Calculation Engine & Scenario Manager
// ==========================================

let currentLang = 'zh'; 
let tcoChartInstance = null;
let gaugeChartInstance = null; 
let latestCalcData = {}; 

let isReportGenerated = false;

// 狀態機與獨立快取陣列
let scenarios = [];
let activeScenarioId = null;
let isCompareMode = false;
let compareChartInstances = {}; 

// 比較模式專屬快取與狀態快照
let compareReportCache = { zh: null, en: null };
let compareStateSnapshot = null;
let isCompareReportOutdated = false;

const DEFAULT_PARAMS = {
    chip: "1",         
    servers: 100,
    nodes: 32,
    cost: 0.10,
    years: 5,
    util: 80,
    air_pue: 1.40,
    liq_pue: 1.15,
    air_capex: 15000,
    liq_capex: 45000
};

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => { clearTimeout(timeout); func(...args); };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function initScenarios() {
    if (scenarios.length === 0) {
        scenarios.push({
            id: 'sc_' + Date.now(),
            name: currentLang === 'zh' ? '情境 A' : 'Scenario A',
            params: null,
            results: null,
            reportCache: { zh: null, en: null } 
        });
        activeScenarioId = scenarios[0].id;
    }
    renderScenarioBar();
}

function loadStateFromURL() {
    const params = new URLSearchParams(window.location.search);
    const setVal = (id, paramKey, defaultVal, isFloat = false) => {
        let val = params.get(paramKey);
        if (val !== null && !isNaN(val)) {
            val = isFloat ? parseFloat(val) : parseInt(val);
            document.getElementById(id).value = val;
        } else if (val !== null && typeof val === 'string' && id === 'chipType') {
            const validOptions = ["1", "1.2", "1.8"];
            if(validOptions.includes(val)) document.getElementById(id).value = val;
        }
    };

    setVal('chipType', 'chip', DEFAULT_PARAMS.chip, false);
    setVal('totalServers', 'servers', DEFAULT_PARAMS.servers, false);
    let urlNodes = params.get('nodes');
    if (urlNodes !== null && !isNaN(urlNodes)) {
        let n = parseInt(urlNodes); if (n < 10) n = 10; if (n > 72) n = 72;
        document.getElementById('rackValInput').value = n; document.getElementById('serversPerRack').value = n;
    }
    setVal('powerCost', 'cost', DEFAULT_PARAMS.cost, true);
    setVal('evalYears', 'years', DEFAULT_PARAMS.years, true);
    setVal('utilRate', 'util', DEFAULT_PARAMS.util, false);
    setVal('airPue', 'air_pue', DEFAULT_PARAMS.air_pue, true);
    setVal('liqPue', 'liq_pue', DEFAULT_PARAMS.liq_pue, true);
    setVal('airCapex', 'air_capex', DEFAULT_PARAMS.air_capex, true);
    setVal('liqCapex', 'liq_capex', DEFAULT_PARAMS.liq_capex, true);
}

const syncToURL = () => {
    if (isCompareMode) return; 
    const url = new URL(window.location);
    url.searchParams.set('tab', 'tco'); 
    url.searchParams.set('chip', document.getElementById('chipType').value);
    url.searchParams.set('servers', document.getElementById('totalServers').value);
    url.searchParams.set('nodes', document.getElementById('rackValInput').value);
    url.searchParams.set('cost', document.getElementById('powerCost').value);
    url.searchParams.set('years', document.getElementById('evalYears').value);
    url.searchParams.set('util', document.getElementById('utilRate').value);
    url.searchParams.set('air_pue', document.getElementById('airPue').value);
    url.searchParams.set('liq_pue', document.getElementById('liqPue').value);
    url.searchParams.set('air_capex', document.getElementById('airCapex').value);
    url.searchParams.set('liq_capex', document.getElementById('liqCapex').value);
    url.searchParams.set('report', isReportGenerated ? '1' : '0');
    window.history.replaceState({}, '', url);
};

const debouncedSyncToURL = debounce(syncToURL, 300);

function renderScenarioBar() {
    const list = document.getElementById('scenarioList');
    list.innerHTML = '';
    scenarios.forEach((sc, index) => {
        const isActive = sc.id === activeScenarioId && !isCompareMode;
        const baseClass = isActive 
            ? 'bg-indigo-600 text-white shadow-md border-indigo-700' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600';
        
        const deleteBtn = scenarios.length > 1 
            ? `<span onclick="event.stopPropagation(); deleteScenario('${sc.id}')" class="ml-2 px-1 hover:text-red-400 font-black cursor-pointer rounded transition-colors">&times;</span>` 
            : '';

        list.innerHTML += `
            <div class="${baseClass} px-3 py-1.5 rounded-full text-sm font-bold cursor-pointer transition-all flex items-center select-none shrink-0 border" onclick="switchScenario('${sc.id}')">
                <span class="mr-1">${sc.name}</span>
                <span onclick="event.stopPropagation(); renameScenario('${sc.id}')" class="mx-1 hover:text-indigo-300 dark:hover:text-indigo-400 cursor-pointer text-xs transition" title="${currentLang === 'zh'?'重新命名':'Rename'}">✏️</span>
                ${deleteBtn}
            </div>
        `;
    });
    
    const addBtn = document.getElementById('btnAddScenario');
    addBtn.disabled = scenarios.length >= 4; addBtn.style.opacity = scenarios.length >= 4 ? '0.4' : '1'; addBtn.style.cursor = scenarios.length >= 4 ? 'not-allowed' : 'pointer';
    document.getElementById('btnToggleCompare').disabled = scenarios.length < 2;
}

function addScenario() {
    if (scenarios.length >= 4) return;
    const newId = 'sc_' + Date.now();
    const defaultNames = ['A', 'B', 'C', 'D'];
    const name = currentLang === 'zh' ? `情境 ${defaultNames[scenarios.length]}` : `Scenario ${defaultNames[scenarios.length]}`;
    
    const currentSc = scenarios.find(s => s.id === activeScenarioId);
    
    scenarios.push({
        id: newId,
        name: name,
        params: JSON.parse(JSON.stringify(currentSc.params)),
        results: JSON.parse(JSON.stringify(currentSc.results)),
        reportCache: { zh: null, en: null } 
    });
    switchScenario(newId);
}

function switchScenario(id) {
    if (isCompareMode) return;
    activeScenarioId = id;
    const sc = scenarios.find(s => s.id === id);
    
    if (sc && sc.params) {
        document.getElementById('chipType').value = sc.params.chip;
        document.getElementById('totalServers').value = sc.params.servers;
        document.getElementById('rackValInput').value = sc.params.nodes;
        document.getElementById('serversPerRack').value = sc.params.nodes;
        document.getElementById('powerCost').value = sc.params.cost;
        document.getElementById('evalYears').value = sc.params.years;
        document.getElementById('utilRate').value = sc.params.util;
        document.getElementById('airPue').value = sc.params.air_pue;
        document.getElementById('liqPue').value = sc.params.liq_pue;
        document.getElementById('airCapex').value = sc.params.air_capex;
        document.getElementById('liqCapex').value = sc.params.liq_capex;
        
        calculateTCO(); 
        
        if (sc.reportCache && sc.reportCache[currentLang]) {
            renderReportFromData(sc.reportCache[currentLang]);
            document.getElementById('salesReportSection').classList.remove('hidden');
            document.getElementById('reportStateOutdated').classList.add('hidden');
            document.getElementById('reportStateLoading').classList.add('hidden');
            document.getElementById('reportStateSuccess').classList.remove('hidden');
            isReportGenerated = true;
        } else {
            document.getElementById('salesReportSection').classList.add('hidden');
            isReportGenerated = false;
        }
        syncToURL();
    }
    renderScenarioBar();
}

function deleteScenario(id) {
    if (scenarios.length <= 1) return;
    scenarios = scenarios.filter(s => s.id !== id);
    if (activeScenarioId === id) switchScenario(scenarios[scenarios.length - 1].id); else renderScenarioBar();
}

function renameScenario(id) {
    if (isCompareMode) return;
    const sc = scenarios.find(s => s.id === id);
    const newName = prompt(currentLang === 'zh' ? "請輸入情境名稱 (上限 15 字)：" : "Enter scenario name (max 15 chars):", sc.name);
    if (newName && newName.trim() !== '') { sc.name = newName.trim().substring(0, 15); renderScenarioBar(); }
}

function toggleCompareMode() {
    if (scenarios.length < 2) return;
    isCompareMode = !isCompareMode;
    
    const singleView = document.getElementById('singleViewSection');
    const compareView = document.getElementById('compareViewSection');
    const pdfBtn = document.getElementById('btn-export-pdf');
    const copyBtn = document.getElementById('btn-copy-link');
    const scenarioList = document.getElementById('scenarioList');
    
    const editGroup = document.getElementById('scenarioEditGroup');
    const compareGroup = document.getElementById('scenarioCompareGroup');
    
    if (isCompareMode) {
        singleView.classList.add('hidden'); 
        compareView.classList.remove('hidden');
        
        editGroup.classList.add('hidden');
        compareGroup.classList.remove('hidden');
        scenarioList.classList.add('opacity-50', 'pointer-events-none');
        
        pdfBtn.disabled = true; pdfBtn.title = currentLang === 'zh' ? '請退出比較模式再匯出' : 'Exit compare mode to export';
        copyBtn.disabled = true; copyBtn.title = currentLang === 'zh' ? '比較模式不支援分享' : 'Sharing disabled in compare';
        
        renderCompareGrid();

        const currentSnap = JSON.stringify(scenarios.map(s => s.params));
        const hasCache = compareReportCache && compareReportCache[currentLang];

        if (compareStateSnapshot && currentSnap !== compareStateSnapshot) {
            isCompareReportOutdated = true;
            document.getElementById('compareReportSection').classList.remove('hidden');
            document.getElementById('compareReportSuccess').classList.add('hidden');
            document.getElementById('compareReportLoading').classList.add('hidden');
            document.getElementById('compareReportOutdated').classList.remove('hidden');
            
        } else if (hasCache) {
            isCompareReportOutdated = false;
            document.getElementById('compareReportContent').innerText = compareReportCache[currentLang];
            document.getElementById('compareReportSection').classList.remove('hidden');
            document.getElementById('compareReportSuccess').classList.remove('hidden');
            document.getElementById('compareReportOutdated').classList.add('hidden');
        } else {
            document.getElementById('compareReportSection').classList.add('hidden');
        }

    } else {
        singleView.classList.remove('hidden'); 
        compareView.classList.add('hidden');
        
        editGroup.classList.remove('hidden');
        compareGroup.classList.add('hidden');
        scenarioList.classList.remove('opacity-50', 'pointer-events-none');
        
        pdfBtn.disabled = false; pdfBtn.title = ''; copyBtn.disabled = false; copyBtn.title = '';
        calculateTCO();
    }
    renderScenarioBar();
}

function renderCompareGrid() {
    const grid = document.getElementById('compareGrid'); grid.innerHTML = '';
    const cols = scenarios.length;
    let gridClass = 'grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch';
    if (cols === 3) gridClass += ' lg:grid-cols-3'; if (cols === 4) gridClass += ' lg:grid-cols-4';
    grid.className = gridClass;
    
    Object.values(compareChartInstances).forEach(c => c.destroy()); compareChartInstances = {};
    
    scenarios.forEach(sc => {
        const res = sc.results; if (!res) return;
        const isAirWinner = res.totalSavings <= 0;
        const winnerText = isAirWinner ? (currentLang === 'zh' ? '氣冷' : 'Air') : (currentLang === 'zh' ? '液冷' : 'Liquid');
        const winnerColor = isAirWinner ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400';
        const beText = (res.breakevenYear > 0 && res.breakevenYear !== Infinity) ? res.breakevenYear.toFixed(1) + " Yrs" : "N/A";
        
        const card = document.createElement('div');
        card.className = "bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 flex flex-col h-full transform transition hover:-translate-y-1 hover:shadow-lg";
        card.innerHTML = `
            <div class="border-b border-gray-100 dark:border-gray-700 pb-3 mb-5"><h3 class="text-xl font-black text-gray-800 dark:text-gray-100 flex items-center justify-between"><span class="truncate pr-2">${sc.name}</span><span class="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-lg whitespace-nowrap">${res.kwPerRack.toFixed(1)} kW</span></h3></div>
            <div class="flex justify-between items-center mb-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <div class="text-center w-1/3 border-r border-gray-200 dark:border-gray-700"><p class="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">${currentLang === 'zh' ? '最佳方案' : 'Best Opt.'}</p><p class="text-lg font-black ${winnerColor}">${winnerText}</p></div>
                <div class="text-center w-1/3 border-r border-gray-200 dark:border-gray-700 pl-2"><p class="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">${currentLang === 'zh' ? '總省下' : 'Savings'}</p><p class="text-lg font-black text-green-600">+$${Math.abs(res.totalSavings).toLocaleString(undefined, {maximumFractionDigits: 0})}</p></div>
                <div class="text-center w-1/3 pl-2"><p class="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">${currentLang === 'zh' ? '回本點' : 'Breakeven'}</p><p class="text-lg font-black text-purple-600">${beText}</p></div>
            </div>
            <div class="w-full h-[220px] mt-auto relative"><canvas id="compChart_${sc.id}"></canvas></div>
        `;
        grid.appendChild(card);
        
        setTimeout(() => {
            const ctx = document.getElementById(`compChart_${sc.id}`).getContext('2d');
            const isDark = document.documentElement.classList.contains('dark');
            
            // 讓小圖表也吃得到特別放大的黃金交叉點
            let radii = res.pointRadii || res.labels.map(() => 1);
            
            compareChartInstances[sc.id] = new Chart(ctx, {
                type: 'line',
                data: { labels: res.labels, datasets: [
                        { label: 'Air', data: res.airData, borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.1, pointRadius: radii, borderWidth: 2 },
                        { label: 'Liquid', data: res.liqData, borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', fill: true, tension: 0.1, pointRadius: radii, borderWidth: 2 }
                    ] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { bodyFont: { size: 12 } } }, scales: { x: { ticks: { color: isDark ? '#9ca3af' : '#6b7280', font: {size: 9}, maxTicksLimit: 3 }, grid: { display: false } }, y: { ticks: { color: isDark ? '#9ca3af' : '#6b7280', maxTicksLimit: 5, font: {size: 9} }, grid: { color: isDark ? '#374151' : '#f3f4f6' } } } }
            });
        }, 100);
    });
}

function resetParameters() {
    document.getElementById('chipType').value = DEFAULT_PARAMS.chip;
    document.getElementById('totalServers').value = DEFAULT_PARAMS.servers;
    document.getElementById('rackValInput').value = DEFAULT_PARAMS.nodes;
    document.getElementById('serversPerRack').value = DEFAULT_PARAMS.nodes;
    document.getElementById('powerCost').value = DEFAULT_PARAMS.cost;
    document.getElementById('evalYears').value = DEFAULT_PARAMS.years;
    document.getElementById('utilRate').value = DEFAULT_PARAMS.util;
    document.getElementById('airPue').value = DEFAULT_PARAMS.air_pue;
    document.getElementById('liqPue').value = DEFAULT_PARAMS.liq_pue;
    document.getElementById('airCapex').value = DEFAULT_PARAMS.air_capex;
    document.getElementById('liqCapex').value = DEFAULT_PARAMS.liq_capex;
    
    isReportGenerated = false;
    document.getElementById('salesReportSection').classList.add('hidden');
    syncToURL();
    calculateTCO();
}

async function copyShareLink() {
    const btn = document.getElementById('btn-copy-link');
    const span = document.getElementById('t-copy-link');
    const originalText = span.innerText;
    syncToURL();

    try {
        await navigator.clipboard.writeText(window.location.href);
        span.innerText = currentLang === 'zh' ? '已複製！' : 'Copied!';
        btn.classList.add('bg-green-100', 'text-green-700', 'border-green-300', 'dark:bg-green-900', 'dark:text-green-300');
        btn.classList.remove('bg-white', 'text-indigo-600', 'border-indigo-200', 'dark:bg-gray-700', 'dark:text-indigo-400');
    } catch (err) {
        span.innerText = currentLang === 'zh' ? '複製失敗' : 'Failed';
    }
    setTimeout(() => {
        span.innerText = originalText;
        btn.classList.remove('bg-green-100', 'text-green-700', 'border-green-300', 'dark:bg-green-900', 'dark:text-green-300');
        btn.classList.add('bg-white', 'text-indigo-600', 'border-indigo-200', 'dark:bg-gray-700', 'dark:text-indigo-400');
    }, 2000);
}

function calculateTCO() {
    const currentParams = {
        chip: document.getElementById('chipType').value,
        servers: document.getElementById('totalServers').value,
        nodes: document.getElementById('rackValInput').value,
        cost: document.getElementById('powerCost').value,
        years: document.getElementById('evalYears').value,
        util: document.getElementById('utilRate').value,
        air_pue: document.getElementById('airPue').value,
        liq_pue: document.getElementById('liqPue').value,
        air_capex: document.getElementById('airCapex').value,
        liq_capex: document.getElementById('liqCapex').value
    };

    const activeSc = scenarios.find(s => s.id === activeScenarioId);
    
    if (activeSc) {
        if (!activeSc.params) {
            activeSc.params = currentParams;
        } else if (JSON.stringify(activeSc.params) !== JSON.stringify(currentParams)) {
            activeSc.params = currentParams;
            activeSc.reportCache = { zh: null, en: null }; 
            if (isReportGenerated) document.getElementById('reportStateOutdated').classList.remove('hidden');
        }
    }

    const chipPower = parseFloat(currentParams.chip);
    const totalServers = parseInt(currentParams.servers);
    const serversPerRack = parseInt(currentParams.nodes);
    const powerCost = parseFloat(currentParams.cost);
    const evalYears = parseFloat(currentParams.years) || 5; 
    const utilRate = parseFloat(currentParams.util) / 100 || 0.8;
    const airPUE = parseFloat(currentParams.air_pue);
    const liqPUE = parseFloat(currentParams.liq_pue);
    const airCapExPerRack = parseFloat(currentParams.air_capex);
    const liqCapExPerRack = parseFloat(currentParams.liq_capex);

    debouncedSyncToURL();

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

    const airTotalKwh = totalKw * airPUE * utilRate * hoursPerYear * evalYears;
    const liqTotalKwh = totalKw * liqPUE * utilRate * hoursPerYear * evalYears;
    const co2SavedTons = Math.abs(airTotalKwh - liqTotalKwh) * 0.5 / 1000;

    const finalAirCost = totalAirCapEx + (airOpExPerYear * evalYears);
    const finalLiqCost = totalLiqCapEx + (liqOpExPerYear * evalYears);
    const totalSavings = finalAirCost - finalLiqCost;
    
    // 取得精準的黃金交叉年份
    const beYearRaw = (totalLiqCapEx - totalAirCapEx) / (airOpExPerYear - liqOpExPerYear);

    // 🚀 NEW: 動態安插黃金交叉點 (Data Point Injection)
    let rawYears = [];
    const maxIntYear = Math.floor(evalYears);
    for (let i = 0; i <= maxIntYear; i++) {
        rawYears.push(i);
    }
    // 如果評估年限不是整數，加入最後一年
    if (evalYears % 1 !== 0 && !rawYears.includes(evalYears)) {
        rawYears.push(evalYears);
    }
    
    let hasBreakevenPoint = false;
    // 如果交叉點落在評估區間內，硬塞入陣列中
    if (beYearRaw > 0 && beYearRaw < evalYears && !rawYears.includes(beYearRaw)) {
        rawYears.push(beYearRaw);
        hasBreakevenPoint = true;
    }
    
    // 重新按時間排序，確保折線圖順序正確
    rawYears.sort((a, b) => a - b);
    
    let airData = []; let liqData = []; let labels = [];
    let pointRadii = []; // 讓交叉點視覺放大的陣列

    rawYears.forEach(y => {
        // 判斷是否為剛好命中的交叉點 (處理浮點數誤差)
        const isThisPointBreakeven = hasBreakevenPoint && Math.abs(y - beYearRaw) < 0.001;

        if (y === 0) {
            labels.push(currentLang === 'zh' ? '第0年 (建置期)' : 'Year 0 (CapEx)');
        } else if (isThisPointBreakeven) {
            labels.push(currentLang === 'zh' ? `⭐ 交叉點 (${y.toFixed(1)}年)` : `⭐ Breakeven (${y.toFixed(1)}Y)`);
        } else if (evalYears % 1 !== 0 && Math.abs(y - evalYears) < 0.001) {
            labels.push(currentLang === 'zh' ? `第${y}年 (期末)` : `Year ${y} (End)`);
        } else {
            labels.push(currentLang === 'zh' ? `第${y}年` : `Year ${y}`);
        }
        
        airData.push(totalAirCapEx + (airOpExPerYear * y));
        liqData.push(totalLiqCapEx + (liqOpExPerYear * y));
        
        // 如果是交叉點，節點半徑變大(5)，其餘預設(1)
        pointRadii.push(isThisPointBreakeven ? 5 : 1);
    });

    const isAirWinner = totalSavings <= 0;
    const absSavings = Math.abs(totalSavings);

    document.getElementById('t-savings-title').innerText = currentLang === 'zh' ? `${evalYears}年採用最佳方案(${isAirWinner ? '氣冷' : '液冷'})可省下` : `${evalYears}-Year Savings w/ Best Option (${isAirWinner ? 'Air' : 'Liquid'})`;
    document.getElementById('savings').innerText = "+$" + absSavings.toLocaleString(undefined, {maximumFractionDigits: 0});
    document.getElementById('savings').className = isAirWinner ? "text-sm md:text-xl font-bold text-blue-600 dark:text-blue-400 mt-1" : "text-sm md:text-xl font-bold text-red-600 dark:text-red-400 mt-1";
    document.getElementById('breakeven').innerText = (beYearRaw > 0 && beYearRaw !== Infinity) ? beYearRaw.toFixed(1) + "Y" : "N/A";
    document.getElementById('t-chart-title').innerText = currentLang === 'zh' ? `${evalYears} 年 TCO 累積成本比較 (CapEx + OpEx)` : `${evalYears}-Year TCO Comparison (CapEx + OpEx)`;

    let winnerStr = kwPerRack < 40 ? "air" : "liquid";
    let gaugeColor, gaugeStatusText;
    const warningBanner = document.getElementById('gaugeWarningBanner');
    
    if (kwPerRack < 40) {
        gaugeColor = '#22c55e'; gaugeStatusText = currentLang === 'zh' ? '傳統氣冷 (Air)' : 'Air Cooling';
        warningBanner.classList.add('hidden');
    } else if (kwPerRack <= 80) {
        gaugeColor = '#eab308'; gaugeStatusText = currentLang === 'zh' ? '氣冷極限 (RDHX)' : 'Air Limit (RDHX)';
        warningBanner.classList.add('hidden');
    } else {
        gaugeColor = '#ef4444'; gaugeStatusText = currentLang === 'zh' ? '強制液冷 (DLC)' : 'Must use DLC';
        warningBanner.classList.remove('hidden'); 
    }

    document.getElementById('gaugeValueText').innerText = kwPerRack.toFixed(1) + " kW";
    document.getElementById('gaugeValueText').style.color = gaugeColor;
    document.getElementById('gaugeStatusText').innerText = gaugeStatusText;
    document.getElementById('gaugeStatusText').style.color = gaugeColor;

    // 將真實精確年份陣列 (yearPoints) 與點半徑存入快取中
    latestCalcData = {
        evalYears, utilRate, totalServers, totalRacks, totalKw, powerCost, airPUE, liqPUE, kwPerRack,
        airCapExPerRack, liqCapExPerRack, totalAirCapEx, totalLiqCapEx,
        airOpExPerYear, liqOpExPerYear, labelsCount: labels.length,
        breakevenYear: beYearRaw, totalSavings, winnerStr, gaugeColor, gaugeStatusText, co2SavedTons,
        labels, airData, liqData, yearPoints: rawYears, pointRadii
    };

    drawChart(labels, airData, liqData, pointRadii);
    drawGaugeChart(kwPerRack, gaugeColor); 
    
    if (activeSc) activeSc.results = JSON.parse(JSON.stringify(latestCalcData)); 
}

function drawGaugeChart(kwPerRack, color, isPrintMode = false) {
    const ctx = document.getElementById('gaugeChart').getContext('2d');
    const isDark = document.documentElement.classList.contains('dark');
    const bgColor = isPrintMode ? '#e2e8f0' : (isDark ? '#374151' : '#e5e7eb'); 
    const maxKw = 140; const currentVal = Math.min(kwPerRack, maxKw); const remainVal = Math.max(maxKw - currentVal, 0);

    if (gaugeChartInstance) gaugeChartInstance.destroy();
    gaugeChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: ['Current kW', 'Remaining'], datasets: [{ data: [currentVal, remainVal], backgroundColor: [color, bgColor], borderWidth: 0, circumference: 180, rotation: 270 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false }, tooltip: { enabled: false } }, animation: isPrintMode ? false : { animateScale: true, animateRotate: true } }
    });
}

function renderReportFromData(data) {
    document.getElementById('reportContentPitch').innerText = data.pitch;
    document.getElementById('reportContentObj').innerText = data.obj;
    document.getElementById('reportContentROI').innerText = data.roi;
    document.getElementById('reportContentESG').innerText = data.esg;
    document.getElementById('reportContentRisk').innerText = data.risk;
}

function generateSalesReport() {
    const section = document.getElementById('salesReportSection');
    const outdated = document.getElementById('reportStateOutdated');
    const loading = document.getElementById('reportStateLoading');
    const error = document.getElementById('reportStateError');
    const success = document.getElementById('reportStateSuccess');

    const activeSc = scenarios.find(s => s.id === activeScenarioId);
    section.classList.remove('hidden'); outdated.classList.add('hidden');

    if (activeSc && activeSc.reportCache && activeSc.reportCache[currentLang]) {
        renderReportFromData(activeSc.reportCache[currentLang]);
        loading.classList.add('hidden'); success.classList.remove('hidden');
        isReportGenerated = true; syncToURL();
        return;
    }

    error.classList.add('hidden'); success.classList.add('hidden'); loading.classList.remove('hidden');
    
    setTimeout(() => {
        try {
            const d = latestCalcData;
            let pitch, obj, roi, esg, risk;
            const beText = (d.breakevenYear > 0 && d.breakevenYear <= d.evalYears) ? d.breakevenYear.toFixed(1) : ">" + d.evalYears;

            if (d.winnerStr === "air") {
                pitch = currentLang === 'zh' 
                    ? `客戶您好，根據您 ${d.totalKw}kW 的總運算需求，我們建議採用成熟的「傳統氣冷方案」。這不僅能確保與您現有機房設施 100% 相容，更省下了龐大的液冷硬體溢價。` 
                    : `Based on your ${d.totalKw}kW requirement, we recommend the Air Cooling solution. It ensures 100% compatibility with existing facilities and avoids hefty liquid premiums.`;
                obj = currentLang === 'zh'
                    ? `若客戶問：「現在不都改用液冷了嗎？」\n👉 回覆策略：液冷是趨勢，但在單櫃 ${d.kwPerRack.toFixed(1)}kW 密度下，不足以彌補初期 CapEx 差異。氣冷是目前 ROI 最高的選擇。`
                    : `If client asks: "Isn't liquid the future?"\n👉 Strategy: At ${d.kwPerRack.toFixed(1)}kW/rack, density doesn't justify CapEx. Air offers best ROI.`;
                risk = currentLang === 'zh' ? `✅ 零機房改建風險\n✅ 隨插即用 (Plug & Play)\n✅ 供應鏈交期短，無須等待冰水主機廠勘。` : `✅ No facility upgrade\n✅ Plug & Play\n✅ Shorter lead time.`;
            } else {
                pitch = currentLang === 'zh'
                    ? `客戶您好，您的高密度需求（單櫃 ${d.kwPerRack.toFixed(1)}kW）已逼近極限。導入「直接液冷 (DLC)」，PUE 可降至 ${d.liqPUE}，讓晶片滿血運作不降頻。`
                    : `With ${d.kwPerRack.toFixed(1)}kW/rack, you're approaching limits. Adopting DLC drops PUE to ${d.liqPUE}, ensuring GPUs run without thermal throttling.`;
                obj = currentLang === 'zh'
                    ? `若客戶嫌貴：「初期建置多花幾千萬太貴了。」\n👉 回覆策略：沒錯，但液冷每年能省龐大電費！這筆投資預計第 ${beText} 年就會達到回本，之後每年都是淨賺。`
                    : `If client objects: "Upfront cost is too high."\n👉 Strategy: True, but it saves massive power bills. You break even in Year ${beText}, after which it's pure profit.`;
                risk = currentLang === 'zh' ? `⚠️ 需評估冰水主機 (CDU) 與二次側管線。\n⚠️ 建議提早 3 個月啟動機房水路廠勘。\n⚠️ 需確認樓板承重。` : `⚠️ Requires CDU & plumbing assessment.\n⚠️ Start facility survey 3 months early.\n⚠️ Check floor loading limits.`;
            }

            roi = currentLang === 'zh'
                ? `▪️ ${d.evalYears}年省下：$${Math.abs(d.totalSavings).toLocaleString(undefined, {maximumFractionDigits: 0})}\n▪️ 黃金交叉：第 ${beText} 年`
                : `▪️ ${d.evalYears}-Yr Savings: $${Math.abs(d.totalSavings).toLocaleString(undefined, {maximumFractionDigits: 0})}\n▪️ Breakeven: Yr ${beText}`;
            
            esg = currentLang === 'zh'
                ? `相較於劣勢方案，${d.evalYears}年累計可減少約\n🌍 ${d.co2SavedTons.toLocaleString(undefined, {maximumFractionDigits: 1})} 公噸 CO2 排放\n(助力企業達成永續指標)`
                : `Compared to the alternative, saves approx.\n🌍 ${d.co2SavedTons.toLocaleString(undefined, {maximumFractionDigits: 1})} Tons of CO2\nover ${d.evalYears} years.`;

            const generatedData = { pitch, obj, roi, esg, risk };
            if (activeSc) activeSc.reportCache[currentLang] = generatedData;
            renderReportFromData(generatedData);
            
            loading.classList.add('hidden'); success.classList.remove('hidden');
            isReportGenerated = true; syncToURL();
        } catch (e) { loading.classList.add('hidden'); error.classList.remove('hidden'); console.error(e); }
    }, 800);
}

function generateCompareReport() {
    const loading = document.getElementById('compareReportLoading');
    const success = document.getElementById('compareReportSuccess');
    const content = document.getElementById('compareReportContent');
    const outdatedOverlay = document.getElementById('compareReportOutdated');
    
    document.getElementById('compareReportSection').classList.remove('hidden');
    outdatedOverlay.classList.add('hidden');
    loading.classList.remove('hidden');
    success.classList.add('hidden');
    
    setTimeout(() => {
        let bestSc = scenarios[0];
        let worstSc = scenarios[0];
        const getCost = (sc) => Math.min(sc.results.airData[sc.results.airData.length-1], sc.results.liqData[sc.results.liqData.length-1]);
        
        scenarios.forEach(s => {
            if (getCost(s) < getCost(bestSc)) bestSc = s;
            if (getCost(s) > getCost(worstSc)) worstSc = s;
        });
        
        const diff = getCost(worstSc) - getCost(bestSc);
        const isZh = currentLang === 'zh';
        const bestCooling = bestSc.results.winnerStr === 'air' ? (isZh ? '傳統氣冷' : 'Air Cooling') : (isZh ? '直接液冷' : 'Liquid Cooling');
        
        let text = '';
        if (diff === 0 && bestSc.id === worstSc.id) {
            text = isZh ? `目前各情境設定導致的成本過於相近，無顯著差異。建議您進一步拉開節點數或電費差距以利對比。` : `Current scenarios show similar costs. Adjust parameters to see a broader comparison difference.`;
        } else {
            text = isZh ? 
                `經綜合評估畫面上 ${scenarios.length} 組決策情境，【${bestSc.name}】展現出最優異的 TCO 投資報酬率。\n\n對比成本最高的【${worstSc.name}】，在 ${bestSc.results.evalYears} 年生命週期內，預計可為企業額外省下高達 $${diff.toLocaleString(undefined, {maximumFractionDigits:0})} USD 的總營運支出。\n\n👉 戰略推薦：強烈建議將【${bestSc.name}】 (單櫃 ${bestSc.results.kwPerRack.toFixed(1)}kW 搭配 ${bestCooling}) 作為本專案的落地首選規格，這能在極大化算力密度的同時，將機房長期維運成本降至最低。` : 
                `After analyzing ${scenarios.length} scenarios, 【${bestSc.name}】 offers the highest TCO ROI.\n\nCompared to the most expensive option (【${worstSc.name}】), it saves an additional $${diff.toLocaleString(undefined, {maximumFractionDigits:0})} USD over ${bestSc.results.evalYears} years.\n\n👉 Executive Recommendation: We strongly advise adopting 【${bestSc.name}】 (${bestSc.results.kwPerRack.toFixed(1)}kW/rack with ${bestCooling}) as the project baseline to maximize compute density while minimizing OPEX.`;
        }
        
        compareReportCache[currentLang] = text;
        compareStateSnapshot = JSON.stringify(scenarios.map(s => s.params));
        isCompareReportOutdated = false;
        
        content.innerText = text;
        loading.classList.add('hidden');
        success.classList.remove('hidden');
    }, 800);
}

function exportComparePNG() {
    if (!compareReportCache[currentLang] || isCompareReportOutdated) {
        document.getElementById('exportPromptModal').classList.remove('hidden');
    } else {
        captureCompareView();
    }
}

async function generateAndExportCompare() {
    closeExportPrompt();
    generateCompareReport();
    setTimeout(() => { captureCompareView(); }, 900); 
}

function forceExportCompare() {
    closeExportPrompt();
    captureCompareView();
}

function closeExportPrompt() {
    document.getElementById('exportPromptModal').classList.add('hidden');
}

async function captureCompareView() {
    const btn = document.getElementById('btn-export-png');
    const originalHtml = btn.innerHTML;
    const isZh = currentLang === 'zh';
    btn.innerHTML = `⏳ <span class="ml-1">${isZh ? '擷取中...' : 'Capturing...'}</span>`;
    
    const originalScrollY = window.scrollY;
    window.scrollTo(0, 0);

    document.querySelectorAll('.capture-hide').forEach(el => el.classList.add('hidden'));
    const targetEl = document.getElementById('compareCaptureArea');
    const isDark = document.documentElement.classList.contains('dark');
    const bgColorClass = isDark ? 'bg-gray-900' : 'bg-gray-50';

    const captureWrapper = document.createElement('div');
    captureWrapper.id = 'captureWrapper'; 
    captureWrapper.className = `${bgColorClass} p-8 flex flex-col rounded-2xl w-full h-auto`;

    Array.from(targetEl.childNodes).forEach(node => captureWrapper.appendChild(node));
    targetEl.appendChild(captureWrapper);

    try {
        await new Promise(r => setTimeout(r, 150)); 
        const canvas = await html2canvas(targetEl, { 
            scale: 2, 
            useCORS: true, 
            backgroundColor: isDark ? '#111827' : '#f8fafc'
        });
        
        const link = document.createElement('a');
        link.download = `TCO_Compare_Scenarios.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (err) {
        console.error("Screenshot failed:", err);
        alert(isZh ? '截圖失敗，請稍後再試。' : 'Screenshot failed.');
    } finally {
        const targetEl = document.getElementById('compareCaptureArea');
        const captureWrapper = document.getElementById('captureWrapper');

        if (captureWrapper) {
            Array.from(captureWrapper.childNodes).forEach(node => targetEl.appendChild(node));
            targetEl.removeChild(captureWrapper);
        }
        document.querySelectorAll('.capture-hide').forEach(el => el.classList.remove('hidden'));
        window.scrollTo(0, originalScrollY);
        btn.innerHTML = originalHtml;
    }
}

// 🚀 核心修復：完美讀取精確年份與平手狀態判定
function openDrilldownModal(dataIndex, labelStr) {
    const d = latestCalcData; 
    // 透過 dataIndex 反查真實的浮點數年份 (例如 3.4)
    const actualYear = d.yearPoints[dataIndex]; 
    
    document.getElementById('modalYearLabel').innerText = (currentLang === 'zh' ? '成本結構拆解：' : 'Cost Breakdown: ') + labelStr;
    
    // 文字顯示防呆：整數顯示 "3年"，浮點數顯示 "3.4年"
    let yearTextZH = actualYear === Math.floor(actualYear) ? `${actualYear}年` : `${actualYear.toFixed(1)}年`;
    let yearTextEN = actualYear === Math.floor(actualYear) ? `${actualYear} Yrs` : `${actualYear.toFixed(1)} Yrs`;

    const airOpex = d.airOpExPerYear * actualYear; 
    const airTotal = d.totalAirCapEx + airOpex;
    document.getElementById('airCapexDetail').innerText = `${d.totalRacks} Racks × $${d.airCapExPerRack.toLocaleString()}`;
    if (actualYear === 0) { 
        document.getElementById('airOpexDetail').innerText = currentLang === 'zh' ? "建置初期，尚無營運電費產生。" : "No OpEx in Year 0."; 
    } else { 
        document.getElementById('airOpexDetail').innerHTML = currentLang === 'zh' ? `總功耗 ${d.totalKw}kW × <b>PUE ${d.airPUE}</b><br>× 稼動率 ${d.utilRate*100}% × 8760hrs<br>× $${d.powerCost}/kWh × <b>${yearTextZH}</b>` : `Total Pwr ${d.totalKw}kW × <b>PUE ${d.airPUE}</b><br>× Util. ${d.utilRate*100}% × 8760hrs<br>× $${d.powerCost}/kWh × <b>${yearTextEN}</b>`; 
    }
    document.getElementById('airTotalDetail').innerText = "$" + airTotal.toLocaleString(undefined, {maximumFractionDigits: 0});
    
    const liqOpex = d.liqOpExPerYear * actualYear; 
    const liqTotal = d.totalLiqCapEx + liqOpex;
    document.getElementById('liqCapexDetail').innerText = `${d.totalRacks} Racks × $${d.liqCapExPerRack.toLocaleString()}`;
    if (actualYear === 0) { 
        document.getElementById('liqOpexDetail').innerText = currentLang === 'zh' ? "建置初期，尚無營運電費產生。" : "No OpEx in Year 0."; 
    } else { 
        document.getElementById('liqOpexDetail').innerHTML = currentLang === 'zh' ? `總功耗 ${d.totalKw}kW × <b>PUE ${d.liqPUE}</b><br>× 稼動率 ${d.utilRate*100}% × 8760hrs<br>× $${d.powerCost}/kWh × <b>${yearTextZH}</b>` : `Total Pwr ${d.totalKw}kW × <b>PUE ${d.liqPUE}</b><br>× Util. ${d.utilRate*100}% × 8760hrs<br>× $${d.powerCost}/kWh × <b>${yearTextEN}</b>`; 
    }
    document.getElementById('liqTotalDetail').innerText = "$" + liqTotal.toLocaleString(undefined, {maximumFractionDigits: 0});
    
    // 為了避免 JS 浮點數微小誤差，進行四捨五入後再判定勝負
    const roundedAir = Math.round(airTotal);
    const roundedLiq = Math.round(liqTotal);
    const diff = Math.abs(roundedAir - roundedLiq); 
    
    let winnerText = "";
    if (roundedAir < roundedLiq) { 
        winnerText = currentLang === 'zh' ? `🏆 氣冷勝出 (節省 $${diff.toLocaleString(undefined, {maximumFractionDigits: 0})})` : `🏆 Air Wins (Save $${diff.toLocaleString(undefined, {maximumFractionDigits: 0})})`; 
        document.getElementById('modalDiff').className = "bg-blue-100 dark:bg-blue-900/40 p-4 text-center text-lg font-bold text-blue-800 dark:text-blue-300 border-t border-blue-200 dark:border-blue-800"; 
    } else if (roundedLiq < roundedAir) { 
        winnerText = currentLang === 'zh' ? `🏆 液冷勝出 (節省 $${diff.toLocaleString(undefined, {maximumFractionDigits: 0})})` : `🏆 Liquid Wins (Save $${diff.toLocaleString(undefined, {maximumFractionDigits: 0})})`; 
        document.getElementById('modalDiff').className = "bg-red-100 dark:bg-red-900/40 p-4 text-center text-lg font-bold text-red-800 dark:text-red-300 border-t border-red-200 dark:border-red-800"; 
    } else { 
        // 🚀 命中黃金交叉的專屬紫色面板
        winnerText = currentLang === 'zh' ? "⚖️ 黃金交叉 (成本平手)" : "⚖️ Breakeven (Costs Tied)"; 
        document.getElementById('modalDiff').className = "bg-purple-100 dark:bg-purple-900/40 p-4 text-center text-lg font-bold text-purple-800 dark:text-purple-300 border-t border-purple-200 dark:border-purple-800"; 
    }
    
    document.getElementById('modalDiff').innerText = winnerText; 
    document.getElementById('drilldownModal').classList.remove('hidden');
}

function drawChart(labels, airData, liqData, pointRadii = null, isPrintMode = false) {
    const ctx = document.getElementById('tcoChart').getContext('2d'); const isDark = document.documentElement.classList.contains('dark');
    const textColor = isPrintMode ? '#0f172a' : (isDark ? '#e5e7eb' : '#374151'); const gridColor = isPrintMode ? '#e2e8f0' : (isDark ? '#374151' : '#e5e7eb');
    if (tcoChartInstance) tcoChartInstance.destroy();
    
    const radiusArray = pointRadii || labels.map(() => 1);

    tcoChartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels: labels, datasets: [ 
            { label: currentLang === 'zh' ? '氣冷累積成本 (Air)' : 'Air Cooling TCO', data: airData, borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.1, pointRadius: radiusArray, pointHoverRadius: 8, pointHitRadius: 10, borderWidth: 2 }, 
            { label: currentLang === 'zh' ? '液冷累積成本 (Liquid)' : 'Liquid Cooling TCO', data: liqData, borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', fill: true, tension: 0.1, pointRadius: radiusArray, pointHoverRadius: 8, pointHitRadius: 10, borderWidth: 2 } 
        ] },
        options: { responsive: true, maintainAspectRatio: false, animation: isPrintMode ? false : true, onClick: (event) => { if (isPrintMode) return; const points = tcoChartInstance.getElementsAtEventForMode(event, 'index', { intersect: false }, true); if (points.length) openDrilldownModal(points[0].index, labels[points[0].index]); }, interaction: { mode: 'index', intersect: false }, plugins: { legend: { labels: { color: textColor } }, tooltip: { enabled: !isPrintMode, bodyFont: { size: 14 } } }, scales: { x: { ticks: { color: textColor }, grid: { color: gridColor } }, y: { ticks: { color: textColor }, grid: { color: gridColor }, title: { display: true, text: 'USD ($)', color: textColor } } } }
    });
}

function openExportModal() {
    const chipSelect = document.getElementById('chipType'); const chipKey = chipSelect.options[chipSelect.selectedIndex].text.match(/[a-zA-Z0-9]+/g)?.[1] || 'Chip';
    document.getElementById('exportFilename').value = `TCO_Report_${chipKey}_${latestCalcData.totalServers}Nodes`;
    document.getElementById('exportModal').classList.remove('hidden'); document.getElementById('exportFilename').focus();
}
function closeExportModal() { document.getElementById('exportModal').classList.add('hidden'); }

async function executePDFExport() {
    const btn = document.getElementById('btn-confirm-export'); const originalHtml = btn.innerHTML; const isZh = currentLang === 'zh';
    let userFilename = document.getElementById('exportFilename').value.trim() || "TCO_Report";
    btn.innerHTML = `⏳ <span class="ml-1">${isZh ? '產出中...' : 'Generating...'}</span>`; btn.disabled = true;

    const originalScrollY = window.scrollY;
    window.scrollTo(0, 0);

    try {
        if (!window.jspdf || !window.html2canvas) { alert(isZh ? "PDF 套件載入中，請稍後再試。" : "PDF loading..."); return; }
        const d = latestCalcData; const chipName = document.getElementById('chipType').options[document.getElementById('chipType').selectedIndex].text;

        document.getElementById('pdfMainTitle').innerText = isZh ? 'AI 伺服器 TCO 分析報告' : 'AI Server TCO Analysis Report';
        document.getElementById('pdfDate').innerText = (isZh ? '報告生成日期：' : 'Generated on: ') + new Date().toLocaleDateString();
        document.getElementById('pdfSubtitle').innerText = isZh ? '由 TCO 運算引擎 V2 產生' : 'Generated by TCO Engine V2';
        document.getElementById('pdfParamsTitle').innerHTML = isZh ? '⚙️ 基礎與進階參數設定' : '⚙️ Configuration Parameters';
        document.getElementById('pdfChartsTitle').innerHTML = isZh ? '📊 5年總擁有成本 (TCO) 趨勢分析' : '📊 5-Year TCO Comparison';
        document.getElementById('pdfGaugeTitle').innerHTML = isZh ? '冷卻技術轉折點' : 'Cooling Threshold';
        document.getElementById('pdfPitchTitle').innerHTML = isZh ? '💡 AI 業務提案教戰手冊' : '💡 AI Sales Battlecard';
        document.getElementById('pdfElevatorTitle').innerHTML = isZh ? '🎯 核心說帖' : '🎯 Elevator Pitch';
        document.getElementById('pdfObjectionTitle').innerHTML = isZh ? '🛡️ 反對意見克服' : '🛡️ Objection Handling';
        document.getElementById('pdfROITitle').innerHTML = isZh ? '💰 財務亮點' : '💰 ROI Highlight';
        document.getElementById('pdfESGTitle').innerHTML = isZh ? '🌱 ESG 減碳效益' : '🌱 ESG & Carbon';
        document.getElementById('pdfRiskTitle').innerHTML = isZh ? '⏱️ 建置風險與時程' : '⏱️ Deployment Risk';
        document.getElementById('pdfCopyright').innerText = isZh ? '版權所有 © 2026 Bryan Jhuang. 專為 AI 伺服器 PM 概念驗證設計。' : 'Copyright © 2026 Bryan Jhuang. Designed for AI Server PM PoC.';

        document.getElementById('pdfParams').innerHTML = `
            <div class="flex flex-col border-r border-gray-100 pr-2"><span class="text-slate-500 font-medium">${isZh ? 'AI 伺服器型號' : 'Chip Model'}</span> <b class="text-slate-800">${chipName}</b></div>
            <div class="flex flex-col border-r border-gray-100 pr-2 pl-2"><span class="text-slate-500 font-medium">${isZh ? '總伺服器 / 單櫃' : 'Nodes / Per Rack'}</span> <b class="text-slate-800">${d.totalServers} 台 / ${d.kwPerRack / (parseFloat(document.getElementById('chipType').value))} 台</b></div>
            <div class="flex flex-col border-r border-gray-100 pr-2 pl-2"><span class="text-slate-500 font-medium">${isZh ? '單機櫃功耗' : 'Power per Rack'}</span> <b class="text-red-500">${d.kwPerRack.toFixed(1)} kW</b></div>
            <div class="flex flex-col pl-2"><span class="text-slate-500 font-medium">${isZh ? '電費費率' : 'Power Rate'}</span> <b class="text-slate-800">$${d.powerCost}/kWh</b></div>
            <div class="flex flex-col border-r border-gray-100 border-t pt-2 pr-2 mt-1"><span class="text-slate-500 font-medium">${isZh ? '評估年限' : 'Eval Years'}</span> <b class="text-slate-800">${d.evalYears} Yrs</b></div>
            <div class="flex flex-col border-r border-gray-100 border-t pt-2 pr-2 pl-2 mt-1"><span class="text-slate-500 font-medium">${isZh ? '稼動率' : 'Utilization'}</span> <b class="text-slate-800">${d.utilRate*100}%</b></div>
            <div class="flex flex-col border-r border-gray-100 border-t pt-2 pr-2 pl-2 mt-1"><span class="text-slate-500 font-medium">${isZh ? '氣冷 PUE' : 'Air PUE'}</span> <b class="text-slate-800">${d.airPUE}</b></div>
            <div class="flex flex-col border-t pt-2 pl-2 mt-1"><span class="text-slate-500 font-medium">${isZh ? '液冷 PUE' : 'Liquid PUE'}</span> <b class="text-slate-800">${d.liqPUE}</b></div>
        `;

        const isAirWinner = d.totalSavings <= 0; const bestOpt = isAirWinner ? (isZh ? '傳統氣冷方案 (Air)' : 'Air Cooling') : (isZh ? '強制液冷方案 (Liquid)' : 'Liquid Cooling');
        document.getElementById('pdfWinnerBoard').innerHTML = `
            <div class="text-center border-r border-gray-200 pr-6 w-1/3"><h3 class="text-sm font-bold text-indigo-900 tracking-wide">${isZh ? '👑 最佳 TCO 散熱方案' : '👑 Best TCO Solution'}</h3><p class="text-2xl font-black mt-1 ${isAirWinner ? 'text-blue-600' : 'text-red-600'}">${bestOpt}</p></div>
            <div class="text-center border-r border-gray-200 px-6 w-1/3"><p class="text-xs text-slate-500 uppercase tracking-wider font-bold">${isZh ? '5年總節省成本' : 'Total Savings'}</p><p class="text-2xl font-black text-green-600 mt-1">+$${Math.abs(d.totalSavings).toLocaleString(undefined, {maximumFractionDigits: 0})}</p></div>
            <div class="text-center pl-6 w-1/3"><p class="text-xs text-slate-500 uppercase tracking-wider font-bold">${isZh ? '黃金交叉回本點' : 'Breakeven Point'}</p><p class="text-2xl font-black text-purple-600 mt-1">${d.breakevenYear > 0 && d.breakevenYear !== Infinity ? d.breakevenYear.toFixed(1) + ' Yrs' : 'N/A'}</p></div>
        `;

        document.getElementById('pdfGaugeValueText').innerText = d.kwPerRack.toFixed(1) + " kW"; document.getElementById('pdfGaugeValueText').style.color = d.gaugeColor; document.getElementById('pdfGaugeStatusText').innerText = d.gaugeStatusText; document.getElementById('pdfGaugeStatusText').style.color = d.gaugeColor;

        drawGaugeChart(d.kwPerRack, d.gaugeColor, true); drawChart(d.labels, d.airData, d.liqData, d.pointRadii, true);
        await new Promise(r => setTimeout(r, 400));
        document.getElementById('pdfGaugeImg').src = gaugeChartInstance.toBase64Image(); document.getElementById('pdfLineImg').src = tcoChartInstance.toBase64Image();
        drawGaugeChart(d.kwPerRack, d.gaugeColor, false); drawChart(d.labels, d.airData, d.liqData, d.pointRadii, false);

        const reportContent = document.getElementById('pdfReportContent'); const noReportMsg = document.getElementById('pdfNoReportMsg');
        
        const activeSc = scenarios.find(s => s.id === activeScenarioId);
        if (isReportGenerated && activeSc && activeSc.reportCache[currentLang]) {
            const c = activeSc.reportCache[currentLang];
            document.getElementById('pdfPitchText').innerText = c.pitch; document.getElementById('pdfObjText').innerText = c.obj; document.getElementById('pdfROIText').innerText = c.roi; document.getElementById('pdfESGText').innerText = c.esg; document.getElementById('pdfRiskText').innerText = c.risk;
            reportContent.classList.remove('hidden'); noReportMsg.classList.add('hidden');
        } else {
            reportContent.classList.add('hidden'); noReportMsg.classList.remove('hidden'); noReportMsg.innerText = isZh ? '(尚未生成業務教戰手冊，請於系統中點擊產出)' : '(Sales report not generated. Please generate it in the dashboard.)';
        }

        syncToURL(); 
        const urlObj = new URL(window.location.href); urlObj.searchParams.set('tab', 'tco'); 
        const cleanBaseUrl = urlObj.hostname + urlObj.pathname;
        const linkTextSuffix = isZh ? " (內含動態參數設定)" : " (Dynamic parameters included)";
        document.getElementById('pdfUrl').innerText = cleanBaseUrl + linkTextSuffix; 
        document.getElementById('pdfUrl').href = urlObj.toString(); 

        await new Promise(r => setTimeout(r, 100));

        const canvas = await html2canvas(document.getElementById('pdfTemplate'), { 
            scale: 2, 
            useCORS: true, 
            backgroundColor: '#ffffff',
            windowY: 0, 
            scrollY: 0
        });
        const { jsPDF } = window.jspdf; const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
        pdf.save(`${userFilename}.pdf`); closeExportModal();

    } catch (err) { 
        alert(isZh ? '匯出失敗，請檢查設定。' : 'Export failed.'); console.error(err); 
    } finally { 
        window.scrollTo(0, originalScrollY); 
        btn.innerHTML = originalHtml; btn.disabled = false; 
    }
}


// ==========================================
// 🚀 Interactive Guided Tour Engine (Zero-dependency & Bulletproof)
// ==========================================

const tourStepsConfig = [
    { targetId: 'scenarioBar', titleKey: 't-tour-s1-title', descKey: 't-tour-s1-desc' },
    { targetId: 'tcoParamsArea', titleKey: 't-tour-s2-title', descKey: 't-tour-s2-desc' },
    { targetId: 'tcoGaugeCard', titleKey: 't-tour-s3-title', descKey: 't-tour-s3-desc' },
    { targetId: 'tcoChartCard', titleKey: 't-tour-s4-title', descKey: 't-tour-s4-desc' },
    { targetId: 'tcoActionButtons', titleKey: 't-tour-s5-title', descKey: 't-tour-s5-desc' }
];

let currentTourStep = 0;

function startTour() {
    if (window.innerWidth < 1024) return;
    const tcoWrapper = document.getElementById('wrapper-tco');
    if (!tcoWrapper || tcoWrapper.classList.contains('hidden')) return;

    if (isCompareMode) toggleCompareMode();

    currentTourStep = 0;
    
    const overlay = document.getElementById('tourOverlay');
    const tooltip = document.getElementById('tourTooltip');
    if(overlay) { overlay.classList.remove('hidden'); overlay.classList.add('block'); }
    if(tooltip) { tooltip.classList.remove('hidden'); tooltip.classList.add('flex'); }
    
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleTourEsc);

    renderTourStep();
}

function renderTourStep() {
    const step = tourStepsConfig[currentTourStep];
    const targetEl = document.getElementById(step.targetId);
    
    if (!targetEl) { endTour(); return; }

    // 1. 觸發平滑滾動
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // 🚀 核心修復：將文字更新與座標計算「同步」放入 setTimeout 中
    setTimeout(() => {
        try {
            // --- A. 更新多語系文字與按鈕狀態 ---
            const titleText = (typeof dict !== 'undefined' && dict[currentLang]) ? dict[currentLang][step.titleKey] : step.titleKey;
            const descText = (typeof dict !== 'undefined' && dict[currentLang]) ? dict[currentLang][step.descKey] : '載入中...';
            
            document.getElementById('tourTitle').innerHTML = titleText;
            document.getElementById('tourDesc').innerHTML = descText;

            document.getElementById('tourPrevBtn').style.display = currentTourStep === 0 ? 'none' : 'block';
            if (currentTourStep === tourStepsConfig.length - 1) {
                const finishText = (typeof dict !== 'undefined' && dict[currentLang]) ? dict[currentLang]['t-tour-finish'] : 'Finish';
                document.getElementById('tourNextBtn').innerHTML = `<span id="t-tour-finish">${finishText}</span>`;
            } else {
                const nextText = (typeof dict !== 'undefined' && dict[currentLang]) ? dict[currentLang]['t-tour-next'] : 'Next';
                document.getElementById('tourNextBtn').innerHTML = `<span id="t-tour-next">${nextText}</span>`;
            }

            // --- B. 計算並更新絕對座標 ---
            const rect = targetEl.getBoundingClientRect();
            const spotlight = document.getElementById('tourSpotlight');
            if (spotlight) {
                const padding = 12; 
                spotlight.style.top = `${rect.top - padding}px`;
                spotlight.style.left = `${rect.left - padding}px`;
                spotlight.style.width = `${rect.width + padding * 2}px`;
                spotlight.style.height = `${rect.height + padding * 2}px`;
            }

            const tooltip = document.getElementById('tourTooltip');
            if (tooltip) {
                const tooltipRect = tooltip.getBoundingClientRect();
                const padding = 12;
                
                let topPos = rect.bottom + padding + 16;
                if (topPos + tooltipRect.height > window.innerHeight) {
                    topPos = rect.top - padding - tooltipRect.height - 16;
                }
                
                let leftPos = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                if (leftPos < 20) leftPos = 20;
                if (leftPos + tooltipRect.width > window.innerWidth - 20) leftPos = window.innerWidth - tooltipRect.width - 20;

                tooltip.style.top = `${topPos}px`;
                tooltip.style.left = `${leftPos}px`;
            }
        } catch(e) {
            console.error("Tour layout sync error:", e);
            endTour(); 
        }
    }, 350); // 確保在 scrollIntoView 動畫完成的同一瞬間，文字與框線一起變換
}

function nextTourStep() {
    if (currentTourStep < tourStepsConfig.length - 1) {
        currentTourStep++;
        renderTourStep();
    } else {
        endTour();
    }
}

function prevTourStep() {
    if (currentTourStep > 0) {
        currentTourStep--;
        renderTourStep();
    }
}

function endTour() {
    const overlay = document.getElementById('tourOverlay');
    const tooltip = document.getElementById('tourTooltip');
    if(overlay) { overlay.classList.add('hidden'); overlay.classList.remove('block'); }
    if(tooltip) { tooltip.classList.add('hidden'); tooltip.classList.remove('flex'); }
    
    document.body.style.overflow = 'auto'; 
    document.removeEventListener('keydown', handleTourEsc);
    localStorage.setItem('bryan_tour_completed', 'true');
}

function handleTourEsc(e) {
    if (e.key === 'Escape') endTour();
}
