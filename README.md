# 海河六域水平台

海河流域水质监测、时空推演、知识图谱和智能问答平台。

## 技术栈

- 后端：Python 3.11、Flask、uv、Gunicorn
- 数据：SQLite、Neo4j
- 前端：React 19、Vite、静态业务页面
- AI：DeepSeek API
- 部署：Railway

## 目录

```text
backend/
  app.py                    # Flask 入口
  pyproject.toml            # uv 依赖
  requirements.txt          # pip / Railway 依赖
  .env.example              # 环境变量示例
  data/haihe.seed.sqlite3   # SQLite 种子库
  pymysql.py                # SQLite 兼容层
  routes/                   # API
  models/                   # 模型
  services/                 # 服务
  utils/                    # 工具

frontend/
  package.json              # 前端脚本
  index.html                # Vite 入口
  src/                      # React 首页
  pages/                    # 静态业务页面
  assets/                   # 静态资源
  config/                   # 前端配置
  components/ layouts/ services/ state/ utils/

railway.json                # Railway 配置
```

## 环境

- Python 3.11
- uv
- Node.js 22+
- npm
- Neo4j（知识图谱功能需要）

## 作品安装说明

本项目分为后端 `backend/` 和前端 `frontend/` 两部分。安装前请准备 Python 3.11、Node.js 22+、npm；如需使用知识图谱功能，请另行准备 Neo4j。

### 1. 下载项目

```powershell
git clone https://github.com/Apollolxz/haihe-water-platform.git
cd haihe-water-platform
```

### 2. 安装并启动后端

```powershell
cd backend
copy .env.example .env
uv sync
uv run python app.py
```

后端默认运行地址为：

```text
http://127.0.0.1:5001
```

如本机未安装 `uv`，可改用：

```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### 3. 安装并启动前端

另开一个终端：

```powershell
cd frontend
npm install
npm run dev
```

前端默认访问地址为：

```text
http://127.0.0.1:8000
```

### 4. 生产构建

```powershell
cd frontend
npm run build
```

GitHub Pages 构建使用：

```powershell
npm run build:pages
```

构建产物位于 `frontend/dist`。

### 5. 配置说明

常用配置位于 `backend/.env`。基础功能默认使用 SQLite；知识图谱需要配置 Neo4j；智能问答需要配置 `DEEPSEEK_API_KEY`。如前端需要指定后端地址，可访问：

```text
http://127.0.0.1:8000?apiBaseUrl=http://127.0.0.1:5001
```

## 后端配置

```powershell
cd backend
copy .env.example .env
```

常用配置：

```env
SQLITE_PATH=./data/haihe.sqlite3

NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_neo4j_password
NEO4J_DATABASE=neo4j

DEEPSEEK_API_KEY=
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions

SECRET_KEY=replace_with_a_strong_secret
FLASK_HOST=0.0.0.0
FLASK_PORT=5001
FLASK_DEBUG=true
```

## 启动后端

```powershell
cd backend
uv sync
uv run python app.py
```

地址：

```text
http://127.0.0.1:5001
http://127.0.0.1:5001/frontend
```

API：

```text
/api/auth
/api/chat
/api/dashboard
/api/decision
/api/graph
/api/water-quality
```

## 启动前端

```powershell
cd frontend
npm install
npm run dev
```

地址：

```text
http://127.0.0.1:8000
```

指定后端：

```text
http://127.0.0.1:8000?apiBaseUrl=http://127.0.0.1:5001
```

## 构建

```powershell
cd frontend
npm run build
```

产物：

```text
frontend/dist
```

## 预览

```powershell
cd frontend
npm run preview
```

## 测试

```powershell
cd frontend
npm test
```

## Railway

启动命令：

```text
cd backend && gunicorn app:app --bind 0.0.0.0:$PORT
```

部署前构建前端：

```powershell
cd frontend
npm run build
```

## 静态页面

```text
/pages/dashboard.html
/pages/sandbox.html
/pages/knowledge-graph.html
/pages/chat.html
```

## 常见问题

### Flask 依赖缺失

```powershell
cd backend
uv sync
uv run python app.py
```

### Python 3.11 缺失

```powershell
uv python install 3.11
cd backend
uv sync
```

### 前端端口被占用

```powershell
cd frontend
npm run dev -- --port 8001
```

### 前端后端地址错误

清理浏览器 `localStorage` 中的 `haihe.apiBaseUrl`，或使用：

```text
?apiBaseUrl=http://127.0.0.1:5001
```

### SQLite 数据缺失

确认文件存在：

```text
backend/data/haihe.seed.sqlite3
```

### Neo4j 连接失败

检查：

- `NEO4J_URI`
- `NEO4J_USER`
- `NEO4J_PASSWORD`
- `NEO4J_DATABASE`

## 本项目开源代码与组件使用情况说明

本项目为海河流域水质监测、时空推演、知识图谱和智能问答平台。项目业务页面、交互逻辑、接口封装、数据处理流程、部署脚本和页面迁移适配代码主要由本项目开发维护；第三方开源组件仅作为基础框架、构建工具、可视化组件、算法库或运行时依赖使用。

### 前端开源组件

前端采用 React + Vite 构建，主要开源依赖包括：

- React、React DOM、React Router DOM：用于前端组件化渲染与页面路由。
- Vite、@vitejs/plugin-react：用于前端开发服务、构建和 React 编译支持。
- Tailwind CSS、@tailwindcss/vite：用于样式构建与工具类 CSS 支持。
- lucide-react：用于部分图标组件。
- Vitest、Testing Library、jsdom：用于前端单元测试与 DOM 测试环境。

部分历史静态页面及构建后的页面仍会通过 CDN 使用以下前端开源资源：

- ECharts：用于数据大屏、统计分析和图表展示。
- Font Awesome：用于页面图标。
- particles.js：用于登录页、问答页等粒子背景效果。
- vis-network：用于知识图谱网络关系可视化。

### 后端开源组件

后端采用 Python + Flask，主要开源依赖包括：

- Flask、Flask-CORS、Werkzeug、Gunicorn：用于 Web API 服务、跨域处理和线上运行。
- neo4j：用于连接 Neo4j 图数据库。
- PyJWT、bcrypt、python-dotenv：用于身份认证、密码加密和环境变量管理。
- requests、beautifulsoup4：用于 HTTP 请求和文本/HTML 处理。
- numpy、pandas、scikit-learn、xgboost：用于数据分析、模型推理和机器学习相关处理。
- openpyxl：用于 Excel 文件读写。

### 外部服务

- DeepSeek API：用于智能问答与 AI 辅助分析能力。项目通过配置项调用外部 API，不包含 DeepSeek 模型权重或模型源码。
- Neo4j：用于知识图谱数据存储与查询。项目包含连接和查询逻辑，不包含 Neo4j 数据库软件源码。
- Railway、GitHub Pages：分别用于后端和前端部署。

### 自研代码与第三方代码边界

本项目自研部分包括：

- 前端 React 页面适配、页面路由、导航交互、登录/注册/个人中心交互、智能问答交互、知识图谱页面控制逻辑、沙盘页面交互和 GitHub Pages 构建适配。
- 后端 Flask API、认证逻辑、用户种子数据初始化、SQLite 兼容层、图谱查询接口、问答接口、数据大屏接口和水质分析相关业务逻辑。
- 页面样式、业务文案、平台结构、部署工作流和项目配置。

第三方开源组件均通过 `frontend/package.json`、`frontend/package-lock.json`、`backend/requirements.txt` 或 CDN 链接声明和引入。项目未将第三方开源项目整体源码作为自研代码声明；使用相关组件时应遵守其各自许可证要求。实际许可证信息以对应依赖包、CDN 资源或官方仓库发布的许可证为准。
