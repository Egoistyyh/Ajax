const API_BASE = '';

// DOM元素
const provinceSelect = document.getElementById('province');
const citySelect = document.getElementById('city');
const districtSelect = document.getElementById('district');
const regionDisplay = document.getElementById('regionDisplay');
const gdpPlaceholder = document.getElementById('gdpPlaceholder');
const gdpContent = document.getElementById('gdpContent');
const gdpError = document.getElementById('gdpError');
const districtsList = document.getElementById('districtsList');

// Chart.js 实例
let gdpChart = null;

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    loadProvinces();
    loadAvailableDistricts();
});

// 事件监听
provinceSelect.addEventListener('change', onProvinceChange);
citySelect.addEventListener('change', onCityChange);
districtSelect.addEventListener('change', onDistrictChange);

// Ajax请求封装
function ajax(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        resolve(data);
                    } catch (e) {
                        reject(new Error('JSON解析错误'));
                    }
                } else {
                    try {
                        const error = JSON.parse(xhr.responseText);
                        reject(error);
                    } catch (e) {
                        reject(new Error('请求失败'));
                    }
                }
            }
        };
        xhr.onerror = function() {
            reject(new Error('网络错误'));
        };
        xhr.send();
    });
}

// 加载省份列表
async function loadProvinces() {
    showLoading('province');
    try {
        const provinces = await ajax(`${API_BASE}/api/provinces`);
        provinceSelect.innerHTML = '<option value="">请选择省份</option>';
        provinces.forEach(p => {
            const option = document.createElement('option');
            option.value = p.code;
            option.textContent = p.name;
            provinceSelect.appendChild(option);
        });
    } catch (error) {
        console.error('加载省份失败:', error);
    }
    hideLoading('province');
}

// 省份变化处理
async function onProvinceChange() {
    const provinceCode = provinceSelect.value;
    
    // 重置城市和区县选择
    citySelect.innerHTML = '<option value="">请选择城市</option>';
    citySelect.disabled = true;
    districtSelect.innerHTML = '<option value="">请选择区县</option>';
    districtSelect.disabled = true;
    
    // 隐藏GDP信息
    showGdpPlaceholder();
    updateRegionDisplay();
    
    if (!provinceCode) return;
    
    showLoading('city');
    try {
        const cities = await ajax(`${API_BASE}/api/cities/${provinceCode}`);
        citySelect.innerHTML = '<option value="">请选择城市</option>';
        cities.forEach(c => {
            const option = document.createElement('option');
            option.value = c.code;
            option.textContent = c.name;
            citySelect.appendChild(option);
        });
        citySelect.disabled = false;
    } catch (error) {
        console.error('加载城市失败:', error);
    }
    hideLoading('city');
    updateRegionDisplay();
}

// 城市变化处理
async function onCityChange() {
    const cityCode = citySelect.value;
    
    // 重置区县选择
    districtSelect.innerHTML = '<option value="">请选择区县</option>';
    districtSelect.disabled = true;
    
    // 隐藏GDP信息
    showGdpPlaceholder();
    updateRegionDisplay();
    
    if (!cityCode) return;
    
    showLoading('district');
    try {
        const districts = await ajax(`${API_BASE}/api/districts/${cityCode}`);
        districtSelect.innerHTML = '<option value="">请选择区县</option>';
        districts.forEach(d => {
            const option = document.createElement('option');
            option.value = d.code;
            option.textContent = d.name;
            districtSelect.appendChild(option);
        });
        districtSelect.disabled = false;
    } catch (error) {
        console.error('加载区县失败:', error);
    }
    hideLoading('district');
    updateRegionDisplay();
}

// 区县变化处理
async function onDistrictChange() {
    const districtCode = districtSelect.value;
    updateRegionDisplay();
    
    if (!districtCode) {
        showGdpPlaceholder();
        return;
    }
    
    try {
        const gdpData = await ajax(`${API_BASE}/api/gdp/${districtCode}`);
        showGdpData(gdpData);
    } catch (error) {
        showGdpError(error.message || '暂无该区县的GDP数据');
    }
}

// 更新地区显示
function updateRegionDisplay() {
    const province = provinceSelect.options[provinceSelect.selectedIndex]?.text || '';
    const city = citySelect.options[citySelect.selectedIndex]?.text || '';
    const district = districtSelect.options[districtSelect.selectedIndex]?.text || '';
    
    let display = '';
    if (province && province !== '请选择省份') {
        display = province;
        if (city && city !== '请选择城市') {
            display += ' > ' + city;
            if (district && district !== '请选择区县') {
                display += ' > ' + district;
            }
        }
    } else {
        display = '请选择省市区';
    }
    
    regionDisplay.textContent = display;
}

// 显示GDP数据
function showGdpData(data) {
    gdpPlaceholder.style.display = 'none';
    gdpError.style.display = 'none';
    gdpContent.style.display = 'block';
    
    // 更新标题信息
    document.getElementById('districtName').textContent = data.name;
    document.getElementById('districtLocation').textContent = `${data.province} - ${data.city}`;
    document.getElementById('districtDescription').textContent = data.description;
    
    // 更新表格
    updateGdpTable(data.gdp);
    
    // 更新图表
    updateGdpChart(data.gdp, data.name);
    
    // 更新统计摘要
    updateGdpSummary(data.gdp);
}

// 更新GDP表格
function updateGdpTable(gdpList) {
    const tbody = document.getElementById('gdpTableBody');
    tbody.innerHTML = '';
    
    gdpList.forEach((item, index) => {
        const tr = document.createElement('tr');
        const trendClass = item.growth >= 0 ? 'trend-up' : 'trend-down';
        const trendIcon = item.growth >= 0 ? '↑' : '↓';
        
        tr.innerHTML = `
            <td>${item.year}</td>
            <td>${item.value.toFixed(2)}</td>
            <td class="${trendClass}">${item.growth >= 0 ? '+' : ''}${item.growth.toFixed(1)}%</td>
            <td class="${trendClass}">${trendIcon}</td>
        `;
        tbody.appendChild(tr);
    });
}

// 更新GDP图表
function updateGdpChart(gdpList, districtName) {
    const ctx = document.getElementById('gdpChart').getContext('2d');
    
    // 销毁旧图表
    if (gdpChart) {
        gdpChart.destroy();
    }
    
    const years = gdpList.map(item => item.year + '年');
    const values = gdpList.map(item => item.value);
    const growths = gdpList.map(item => item.growth);
    
    gdpChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'GDP (亿元)',
                    data: values,
                    backgroundColor: 'rgba(102, 126, 234, 0.7)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 1,
                    yAxisID: 'y',
                    order: 2
                },
                {
                    label: '同比增长率 (%)',
                    data: growths,
                    type: 'line',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(239, 68, 68, 1)',
                    pointRadius: 4,
                    yAxisID: 'y1',
                    order: 1
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                title: {
                    display: true,
                    text: `${districtName} GDP发展趋势`,
                    font: { size: 14 }
                },
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'GDP (亿元)'
                    },
                    beginAtZero: false
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: '增长率 (%)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

// 更新GDP摘要
function updateGdpSummary(gdpList) {
    const summary = document.getElementById('gdpSummary');
    
    const latestGdp = gdpList[gdpList.length - 1];
    const firstGdp = gdpList[0];
    const avgGrowth = gdpList.reduce((sum, item) => sum + item.growth, 0) / gdpList.length;
    const totalGrowth = ((latestGdp.value - firstGdp.value) / firstGdp.value * 100);
    
    summary.innerHTML = `
        <div class="summary-card">
            <span class="value">${latestGdp.value.toFixed(0)}</span>
            <span class="label">${latestGdp.year}年GDP (亿元)</span>
        </div>
        <div class="summary-card">
            <span class="value">${avgGrowth >= 0 ? '+' : ''}${avgGrowth.toFixed(1)}%</span>
            <span class="label">年均增长率</span>
        </div>
        <div class="summary-card">
            <span class="value">${totalGrowth >= 0 ? '+' : ''}${totalGrowth.toFixed(1)}%</span>
            <span class="label">${firstGdp.year}-${latestGdp.year}累计增长</span>
        </div>
    `;
}

// 显示GDP占位符
function showGdpPlaceholder() {
    gdpPlaceholder.style.display = 'flex';
    gdpContent.style.display = 'none';
    gdpError.style.display = 'none';
}

// 显示GDP错误
function showGdpError(message) {
    gdpPlaceholder.style.display = 'none';
    gdpContent.style.display = 'none';
    gdpError.style.display = 'flex';
    document.getElementById('errorMessage').textContent = message;
}

// 加载已收录的区县列表
async function loadAvailableDistricts() {
    try {
        const districts = await ajax(`${API_BASE}/api/gdp-districts`);
        districtsList.innerHTML = '';
        
        districts.forEach(d => {
            const tag = document.createElement('span');
            tag.className = 'district-tag';
            tag.innerHTML = `${d.name}<span class="city">(${d.city})</span>`;
            tag.addEventListener('click', () => selectDistrict(d));
            districtsList.appendChild(tag);
        });
    } catch (error) {
        districtsList.textContent = '加载失败';
    }
}

// 快速选择区县
async function selectDistrict(district) {
    // 直接显示GDP数据
    try {
        const gdpData = await ajax(`${API_BASE}/api/gdp/${district.code}`);
        showGdpData(gdpData);
        regionDisplay.textContent = `${district.province} > ${district.city} > ${district.name}`;
    } catch (error) {
        showGdpError(error.message || '加载失败');
    }
}

// 显示/隐藏加载状态
function showLoading(type) {
    document.getElementById(`${type}Loading`).classList.add('active');
}

function hideLoading(type) {
    document.getElementById(`${type}Loading`).classList.remove('active');
}
