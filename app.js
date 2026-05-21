// ======= ⚙️ 系統設定區 =======
const SPREADSHEET_CSV_URL = "填入你的 Google 試算表 CSV 網址";
let projectData = []; 

// ======= 🎨 1. 動態注入 UI 結構 =======
function renderAppLayout() {
	const appContainer = document.getElementById('app');
	
    // 這裡就是你原本寫在 body 裡面的所有 HTML 結構
    appContainer.innerHTML = `
        <header class="bg-white border-b border-gray-200 h-[70px] px-6 flex items-center justify-between shadow-xs shrink-0">
            <h1 id="site-title" class="text-xl font-bold text-gray-900">載入中...</h1>
            <span class="text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-sm">
                ● 連線至 Google 試算表
            </span>
        </header>

        <div class="max-w-8xl mx-auto flex flex-1 w-full overflow-hidden min-h-0">
            <aside class="w-1/3 border-r border-gray-200 bg-white overflow-y-auto p-4">
                <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">列表</h2>
                <div id="subject-list" class="space-y-2">
                    <p class="text-sm text-gray-500 animate-pulse">資料載入中...</p>
                </div>
            </aside>

            <main class="w-2/3 flex flex-col h-full bg-gray-50/50 overflow-hidden">
                <section class="p-6 bg-white border-b border-gray-200 shadow-2xs shrink-0">
                    <div class="flex justify-between items-start gap-4 mb-2">
                        <h2 id="detail-title" class="text-lg font-bold text-gray-900">請選擇左側項目</h2>
                        <span id="detail-date" class="text-xs text-gray-400 whitespace-nowrap"></span>
                    </div>
                    <div id="detail-desc" class="text-sm text-gray-600 leading-relaxed whitespace-pre-line"></div>
                </section>

                <section class="flex-1 p-6 overflow-y-auto min-h-0">
                    <div id="detail-html" class="w-full h-full"></div>
                </section>
            </main>
        </div> 

        <footer class="w-full bg-white border-t border-gray-200 px-6 py-3 flex justify-end items-center gap-6 text-xs text-gray-500 font-medium shrink-0">
            <div class="flex items-center gap-1">
                <span class="text-gray-400">程式版本:</span>
                <span id="app-version">讀取中...</span>
            </div>
            <div class="flex items-center gap-1">
                <span class="text-gray-400">資料版本:</span>
                <span id="data-version">讀取中...</span>
            </div>
        </footer>
    `;
}

// ======= 🚀 2. 業務邏輯與 API 呼叫 =======
async function loadSpreadsheetData() {
    try {
		// ----------------------------------------------------
        // 【新增】1. 先動態讀取外部的 url.txt 檔案
        // ----------------------------------------------------
        const configResponse = await fetch('app.setting');
        const base64Text = await configResponse.text();
        
        // 【新增】2. 使用內建 atob() 將 Base64 解碼還原成真實 URL
        // (.trim() 可以濾掉文字檔可能不小心按到的換行或空白)
        const SPREADSHEET_CSV_URL = atob(base64Text.trim());
        
        // ----------------------------------------------------
        // 3. 接下來的邏輯完全不變
        // ----------------------------------------------------
        const response = await fetch(SPREADSHEET_CSV_URL);
        const csvText = await response.text();
        
        const results = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true 
        });
        
        let rawData = results.data;
        
        const configMap = {};
        rawData.forEach(item => {
            if (String(item['功能']).trim() === '0') {
                const key = String(item['主旨']).trim();
                const cleanHtml = (item['內崁html儲存'] || '').replace(/""/g, '"');
                configMap[key] = cleanHtml;
            }
        });

        if (configMap['Title']) {
            document.getElementById('site-title').innerHTML = configMap['Title'];
            document.title = configMap['Title']; // 順便把瀏覽器頁籤標題也換掉
        }
        if (configMap['AppVersion']) document.getElementById('app-version').innerHTML = configMap['AppVersion'];
        if (configMap['DataVersion']) document.getElementById('data-version').innerHTML = configMap['DataVersion'];
        
        projectData = rawData.filter(item => String(item['功能']).trim() === '1');
        projectData.sort((a, b) => Number(a['排序'] || 0) - Number(b['排序'] || 0));
        
        renderSubjectList();
    } catch (error) {
        console.error("資料載入失敗:", error);
        document.getElementById('subject-list').innerHTML = `<p class="text-sm text-red-500">❌ 資料載入失敗，請檢查網址設定。</p>`;
    }
}

function renderSubjectList() {
    const container = document.getElementById('subject-list');
    if (projectData.length === 0) {
        container.innerHTML = `<p class="text-sm text-gray-400">目前沒有資料。</p>`;
        return;
    }

    container.innerHTML = projectData.map((item, index) => `
        <button onclick="showDetail(${index})" class="w-full text-left p-3 rounded-lg border border-gray-100 hover:bg-blue-50/50 hover:border-blue-200 transition cursor-pointer block group">
            <div class="font-medium text-sm text-gray-800 group-hover:text-blue-600 transition truncate">${item['主旨']}</div>
            <div class="text-[11px] text-gray-400 mt-1">排序: ${item['排序'] || 0}</div>
        </button>
    `).join('');
    
    showDetail(0);
}

// 由於是掛載在全域，為確保 onclick 找得到函式，可以把它綁在 window 上
window.showDetail = function(index) {
    const item = projectData[index];
    if (!item) return;

    document.getElementById('detail-title').innerText = item['主旨'];
    document.getElementById('detail-date').innerText = item['建立日期時間'] ? `📅 ${item['建立日期時間']}` : '';
    document.getElementById('detail-desc').innerText = item['描述'] || '無描述';
    
    const htmlContainer = document.getElementById('detail-html');
    let rawHtml = item['內崁html儲存'] || '';

    if (rawHtml) {
        let cleanHtml = rawHtml.replace(/""/g, '"'); 
        if (!cleanHtml.includes('</')) {
            cleanHtml = cleanHtml.replace(/\r?\n/g, '<br>');
        }
        htmlContainer.innerHTML = cleanHtml;
    } else {
        htmlContainer.innerHTML = `<p class="text-xs text-gray-400 italic">此項目無內嵌 HTML 內容</p>`;
    }
}

// ======= 🏁 3. 系統初始化 =======
// 確保 DOM 載入完成後再啟動
document.addEventListener('DOMContentLoaded', () => {
    renderAppLayout();      // 先把骨架畫出來
    loadSpreadsheetData();  // 再去把血肉(資料)抓回來填上
});