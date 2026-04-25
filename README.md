# 海河六域

一个流域水质监测与治理的 Web 平台。前端用纯 HTML/CSS/JS 写成，后端是 Flask，数据存在 MySQL 和 Neo4j 里。

线上地址：
- 前端：https://apollolxz.github.io/haihe-water-platform/pages/index.html
- 后端：https://haihe-water-platform-production.up.railway.app

---

## 项目结构

```
haihe-water-platform/
├── backend/           Flask 后端
│   ├── app.py         入口文件
│   ├── routes/        API 路由（auth、chat、dashboard、graph、water_quality、decision）
│   ├── models/        数据库模型
│   ├── services/      业务逻辑
│   ├── utils/         工具函数
│   └── requirements.txt
├── frontend/          前端页面
│   ├── pages/         HTML 页面（数据大屏、沙盘、知识图谱、问答等）
│   ├── assets/        样式、图片、JS 库
│   ├── components/    前端组件
│   ├── services/      前端接口调用
│   ├── utils/         前端工具函数
│   ├── config/        配置文件
│   └── layouts/       布局脚本
└── start_server.bat   Windows 一键启动脚本

scripts/               GitHub Pages 构建脚本
 docs/                 GitHub Pages 部署目录（由脚本生成）
```

---

## 功能

| 页面 | 说明 |
|------|------|
| 首页 | 平台介绍 |
| 数据大屏 | 六省市水质指标可视化，ECharts 图表 |
| 流域时空推演沙盘 | 水质预测、风险模拟、AI 决策推演 |
| 知识图谱 | Neo4j 图数据库查询，超标事件溯源 |
| 智能问答 | 对接 DeepSeek，支持指标解释和页面使用咨询 |
| 个人中心 | 用户信息、修改密码 |

---

## 本地运行

### 需要的环境

- Python 3.10+
- MySQL
- Neo4j

### 步骤

1. 复制环境变量文件：

```bash
cd haihe-water-platform/backend
cp .env.example .env
```

2. 编辑 `.env`，填上你的数据库密码、Neo4j 密码、DeepSeek API Key 等。

3. 安装依赖：

```bash
pip install -r requirements.txt
```

4. 启动：

```bash
# 方式一：双击
haihe-water-platform/start_server.bat

# 方式二：命令行
cd haihe-water-platform/backend
python app.py
```

5. 浏览器访问：

```
http://127.0.0.1:5001/frontend/pages/index.html
```

### 换电脑运行要注意的

- 除了 `.env` 里的数据库连接信息，还要改这几个路径相关的变量：
  - `SANDBOX_DATA_ROOT` — 沙盘预测结果数据目录
  - `IMPORT_DATA_DIR` / `IMPORT_CSV_PATH` / `COORDINATE_CSV_PATH` — 数据导入用的 CSV 路径
  - `NEO4J_DBMS_HOME` / `NEO4J_JAVA_HOME` — Neo4j 安装路径
- 沙盘相关页面依赖本地预测数据，换机器后需要确认 `backend/utils/sandbox_validation.py` 里的路径是否正确。

---

## 部署

### 前端（GitHub Pages）

前端代码在 `haihe-water-platform/frontend/`，通过脚本构建到 `docs/` 后由 GitHub Pages 自动部署。

构建：

```powershell
.\scripts\build-github-pages.ps1
```

构建脚本会把 `frontend` 下的 `assets`、`components`、`config`、`layouts`、`pages`、`services`、`state`、`utils` 复制到 `docs/`，并给每个 HTML 页面注入运行时配置。

推送后 GitHub Actions 会自动部署（工作流在 `.github/workflows/deploy-pages.yml`）。

**注意**：
- 第一次部署需要在仓库 `Settings -> Pages` 里把发布源改为 `GitHub Actions`。
- 如果后端地址变了，改 `haihe-water-platform/frontend/config/site.config.js` 里的 `apiBaseUrl`，然后重新构建推送。

### 后端（Railway）

后端代码在 `haihe-water-platform/backend/`，直接关联 Railway 项目部署。需要的环境变量跟 `.env.example` 里的一致，在 Railway 后台的 Variables 里设置。

---

## 技术栈

- 前端：原生 HTML + Tailwind CSS + Font Awesome + ECharts + Particles.js
- 后端：Flask + PyMySQL + Neo4j Python Driver
- 数据库：MySQL（水质监测数据）+ Neo4j（知识图谱）
- 部署：GitHub Pages（前端）+ Railway（后端）
