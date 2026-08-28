# Ajax
### 一、项目简介

基于 Ajax 技术实现的省市区三级联动下拉列表框，
选择特定区县后可以查看该区县近年来的GDP发展状况，
包括数据表格和可视化图表。

### 二、环境要求

- Node.js 14.0 或更高版本
- npm 或 yarn 包管理器
- 现代浏览器（Chrome、Firefox、Safari、Edge 等）

### 三、文件结构

├── 源代码/
│   ├── server.js           # Node.js服务器
│   ├── package.json        # 项目配置
│   ├── package-lock.json   # 依赖锁定文件
│   ├── data/               # 数据文件
│   │   ├── regions.json    # 省市区数据
│   │   └── gdp.json        # GDP数据
│   └── public/             # 前端文件
│       ├── index.html      # 主页面
│       ├── styles.css      # 样式文件
│       └── app.js          # 前端Ajax逻辑
├── README.md               # 项目说明文档

### 四、安装步骤

1. 确保已安装 Node.js（版本 14.0 或更高）
   检查命令：node -v

2. 进入源代码目录
   cd 源代码

3. 安装项目依赖
   npm install

   这将安装以下依赖：
   - express：Web服务器框架
   - cors：跨域支持

### 五、运行方法

1. 进入源代码目录
   cd 源代码

2. 启动服务器
   npm start
   或
   node server.js

3. 打开浏览器访问
   http://localhost:3001

### 六、使用说明

1. 从"省份/直辖市"下拉框选择省份
2. 等待城市列表加载完成
3. 从"地级市"下拉框选择城市
4. 从"区/县"下拉框选择区县
5. 系统自动显示该区县的GDP数据

快速查看：
- 页面底部显示"已收录GDP数据的区县"
- 点击任意区县标签可直接查看其GDP数据

### 七、已收录数据

省市区覆盖：北京、上海、广东、浙江、江苏、四川等省市
GDP数据区县（14个）：
- 北京：朝阳区、海淀区
- 上海：浦东新区、黄浦区
- 广东：天河区、南山区、福田区
- 浙江：西湖区、萧山区
- 江苏：昆山市、姑苏区、江宁区
- 四川：武侯区、双流区

### 八、注意事项

- 首次运行需要安装依赖（npm install）
- 服务器默认运行在 3001 端口
- 使用原生 XMLHttpRequest 实现 Ajax 请求
- 图表使用 Chart.js 库（通过 CDN 加载）
- 使用原生 XMLHttpRequest 实现 Ajax 请求
- 图表使用 Chart.js 库（通过 CDN 加载）
