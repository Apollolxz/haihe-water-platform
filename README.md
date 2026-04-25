# 海河水平台

海河流域水质监测与治理 Web 平台。项目包含 Flask 后端、React/Vite 前端，以及迁移期间保留的旧版静态 HTML 页面。

## 技术栈

- 后端：Python 3.11、Flask、PyMySQL、Neo4j Driver、uv
- 前端：React 19、Vite、Vitest、Testing Library、lucide-react
- 数据库：MySQL、Neo4j
- 外部能力：DeepSeek API

## 项目结构

```text
.
├── backend/
│   ├── app.py              # Flask 后端入口
│   ├── pyproject.toml      # uv 后端依赖配置
│   ├── uv.lock             # uv 锁定文件
│   ├── requirements.txt    # 兼容传统部署的 pip 依赖清单
│   ├── .env.example        # 环境变量示例
│   ├── routes/             # API 路由
│   ├── models/             # 数据库模型
│   ├── services/           # 业务服务
│   └── utils/              # 工具函数
└── frontend/
    ├── package.json        # React/Vite 前端脚本和依赖
    ├── index.html          # React 应用 HTML 入口
    ├── vite.config.js      # Vite 与 Vitest 配置
    ├── src/                # React 代码、样式和测试
    ├── scripts/            # 构建辅助脚本
    ├── pages/              # 旧版 HTML 页面，迁移期间保留
    ├── assets/             # 旧版静态资源
    ├── config/             # 旧版运行时配置
    └── services/           # 旧版前端服务脚本
```

## 环境要求

- Python 3.11
- uv
- Node.js 22+
- npm
- MySQL
- Neo4j

安装 uv：

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

如果本机没有 Python 3.11，可用 uv 安装：

```powershell
uv python install 3.11
```

## 后端配置

复制环境变量文件：

```powershell
cd backend
copy .env.example .env
```

编辑 `backend/.env`，至少确认以下配置：

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=haihe_river_basin

NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_neo4j_password

DEEPSEEK_API_KEY=
FLASK_HOST=0.0.0.0
FLASK_PORT=5001
FLASK_DEBUG=true
```

## 启动后端

首次安装或同步依赖：

```powershell
cd backend
uv sync
```

启动 Flask：

```powershell
uv run python app.py
```

后端默认地址：

```text
http://127.0.0.1:5001
```

常用接口前缀：

```text
/api/auth
/api/chat
/api/dashboard
/api/decision
/api/graph
/api/water-quality
```

## 启动 React 前端

首次安装依赖：

```powershell
cd frontend
npm install
```

启动开发服务器：

```powershell
npm run dev
```

前端默认地址：

```text
http://127.0.0.1:8000
```

如果 `8000` 被占用，可指定其他端口：

```powershell
npm run dev -- --port 8001
```

本地联调时，React 前端默认会请求本地后端：

```text
http://127.0.0.1:5001
```

也可以通过 URL 参数临时指定后端地址：

```text
http://127.0.0.1:8000?apiBaseUrl=http://127.0.0.1:5001
```

## 快速启动

1. 启动 MySQL 和 Neo4j。
2. 配置 `backend/.env`。
3. 启动后端：

```powershell
cd backend
uv sync
uv run python app.py
```

4. 另开终端启动前端：

```powershell
cd frontend
npm install
npm run dev
```

5. 浏览器访问：

```text
http://127.0.0.1:8000
```

## 测试

前端单元测试：

```powershell
cd frontend
npm test
```

后端当前没有统一测试入口。可先用下面命令确认 Flask 应用能启动：

```powershell
cd backend
uv run python app.py
```

## 构建

构建 React 前端：

```powershell
cd frontend
npm run build
```

产物输出到：

```text
frontend/dist
```

构建脚本会在 Vite 构建后复制旧版静态目录到 `dist`，包括：

```text
assets/
components/
config/
layouts/
pages/
services/
state/
utils/
```

因此构建产物中同时包含：

- React 首页：`frontend/dist/index.html`
- 旧版页面：`frontend/dist/pages/*.html`

本地预览生产构建：

```powershell
cd frontend
npm run preview
```

## 旧版页面兼容

当前迁移策略是先建立 React/Vite 框架，并保留旧版 HTML 页面。React 首页中的导航会跳转到旧版页面路径，例如：

```text
/pages/dashboard.html
/pages/sandbox.html
/pages/knowledge-graph.html
/pages/chat.html
```

后续可以逐页迁移到 React 组件。迁移完成前，不要删除 `frontend/pages`、`frontend/assets`、`frontend/config` 等旧版目录。

## 依赖维护

新增后端依赖：

```powershell
cd backend
uv add package-name
```

重新生成后端锁定文件：

```powershell
cd backend
uv lock
```

如需同步传统部署用的 `requirements.txt`：

```powershell
cd backend
uv export --no-hashes --format requirements-txt -o requirements.txt
```

新增前端依赖：

```powershell
cd frontend
npm install package-name
```

新增前端开发依赖：

```powershell
cd frontend
npm install -D package-name
```

## 常见问题

### `py` 命令不存在

本项目后端使用 uv 管理环境，不需要执行 `py -m venv .venv`。使用：

```powershell
cd backend
uv sync
uv run python app.py
```

### `ModuleNotFoundError: No module named 'flask'`

说明没有在 uv 环境里运行后端。使用：

```powershell
cd backend
uv sync
uv run python app.py
```

### `uv sync` 找不到 Python 3.11

执行：

```powershell
uv python install 3.11
cd backend
uv sync
```

### 前端端口 8000 被占用

换端口启动：

```powershell
cd frontend
npm run dev -- --port 8001
```

### 前端请求到了错误的后端地址

清理浏览器 localStorage 中的 `haihe.apiBaseUrl`，或在访问地址后追加：

```text
?apiBaseUrl=http://127.0.0.1:5001
```

### 后端连接 MySQL 或 Neo4j 失败

检查：

- MySQL 和 Neo4j 服务是否已启动
- `backend/.env` 中的主机、端口、用户名、密码是否正确
- MySQL 数据库 `MYSQL_DATABASE` 是否存在
- Neo4j `NEO4J_URI` 是否与实际端口一致

## 推荐开发顺序

1. 保持旧版页面可访问。
2. 优先迁移 React 共享能力：API 客户端、布局、导航、鉴权状态。
3. 再逐页迁移业务页面：数据大屏、沙盘、知识图谱、智能问答。
4. 每迁移一个页面，补对应组件测试并确认旧页面入口是否可以移除。
