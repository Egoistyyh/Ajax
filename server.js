const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 读取数据文件 (新格式: 数组结构，使用children)
const regionsRaw = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'regions.json'), 'utf8'));
const gdpData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'gdp.json'), 'utf8'));

// API: 获取所有省份
app.get('/api/provinces', (req, res) => {
    const provinces = regionsRaw.map(p => ({
        code: p.code,
        name: p.name
    }));
    res.json(provinces);
});

// API: 根据省份代码获取城市列表
app.get('/api/cities/:provinceCode', (req, res) => {
    const { provinceCode } = req.params;
    const province = regionsRaw.find(p => p.code === provinceCode);
    
    if (!province || !province.children) {
        return res.status(404).json({ error: '省份不存在' });
    }
    
    const cities = province.children.map(c => ({
        code: c.code,
        name: c.name
    }));
    res.json(cities);
});

// API: 根据城市代码获取区县列表
app.get('/api/districts/:cityCode', (req, res) => {
    const { cityCode } = req.params;
    
    let districts = null;
    for (const province of regionsRaw) {
        if (!province.children) continue;
        const city = province.children.find(c => c.code === cityCode);
        if (city && city.children) {
            // 只取区县级别，不取街道
            districts = city.children.map(d => ({
                code: d.code,
                name: d.name
            }));
            break;
        }
    }
    
    if (!districts) {
        return res.status(404).json({ error: '城市不存在' });
    }
    
    res.json(districts);
});

// API: 根据区县代码获取GDP数据
app.get('/api/gdp/:districtCode', (req, res) => {
    const { districtCode } = req.params;
    const gdpInfo = gdpData[districtCode];
    
    if (!gdpInfo) {
        return res.status(404).json({ 
            error: '暂无该区县的GDP数据',
            message: '该区县的GDP数据尚未收录，请选择其他区县查看。'
        });
    }
    
    res.json(gdpInfo);
});

// API: 获取所有有GDP数据的区县列表
app.get('/api/gdp-districts', (req, res) => {
    const districts = Object.keys(gdpData).map(code => ({
        code,
        name: gdpData[code].name,
        city: gdpData[code].city,
        province: gdpData[code].province
    }));
    res.json(districts);
});

app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});
