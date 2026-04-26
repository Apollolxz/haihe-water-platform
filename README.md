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
