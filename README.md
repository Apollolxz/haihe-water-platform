# 海河六域水质智能治理平台

海河流域水质监测、时空推演、知识图谱和智能问答平台。

## 技术栈

- 前端：React、Vite
- 后端：Python、Flask、Gunicorn
- 数据：SQLite、Neo4j
- AI：DeepSeek API
- 部署：Railway、GitHub Pages

## 目录结构

```text
backend/     后端服务与 API
frontend/    前端应用
railway.json Railway 部署配置
```

## 环境要求

- Python 3.11
- Node.js 22+
- npm
- uv
- Neo4j（知识图谱功能需要）

## 后端启动

```powershell
cd backend
copy .env.example .env
uv sync
uv run python app.py
```

默认地址：

```text
http://127.0.0.1:5001
```

如果不使用 `uv`：

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

## 前端启动

另开一个终端：

```powershell
cd frontend
npm install
npm run dev
```

默认地址：

```text
http://127.0.0.1:8000
```

指定后端地址：

```text
http://127.0.0.1:8000?apiBaseUrl=http://127.0.0.1:5001
```

## 构建

```powershell
cd frontend
npm run build
```

GitHub Pages 构建：

```powershell
npm run build:pages
```

构建产物：

```text
frontend/dist
```

## 测试

```powershell
cd frontend
npm test
```

## 常用配置

后端配置文件：

```text
backend/.env
```

常用环境变量：

```env
SQLITE_PATH=./data/haihe.sqlite3
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_neo4j_password
NEO4J_DATABASE=neo4j
DEEPSEEK_API_KEY=
SECRET_KEY=replace_with_a_strong_secret
FLASK_PORT=5001
```

## 主要页面

```text
/pages/dashboard.html
/pages/sandbox.html
/pages/knowledge-graph.html
/pages/chat.html
```
