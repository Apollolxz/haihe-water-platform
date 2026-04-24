# 海河流域项目

这个仓库当前的可运行项目主体在 [haihe-water-platform](./haihe-water-platform) 目录下

## 目录结构

```text
haihe-water-platform/
├─ backend/                 Flask 后端、接口、Neo4j / MySQL 访问逻辑
├─ frontend/                页面、样式、前端脚本
└─ start_server.bat         Windows 下的快速启动脚本
```

## 运行前准备

1. 安装 Python 3.10+。
2. 准备 MySQL 与 Neo4j，并确保后端配置可连接。
3. 复制 `haihe-water-platform/backend/.env.example` 为 `haihe-water-platform/backend/.env`，再按本机环境填写。
4. 安装依赖：

```bash
cd haihe-water-platform/backend
pip install -r requirements.txt
```

## 启动方式

### 方式 1：双击脚本

运行：

```text
haihe-water-platform/start_server.bat
```

### 方式 2：命令行启动

```bash
cd haihe-water-platform/backend
python app.py
```

启动成功后，访问：

```text
http://127.0.0.1:5001/frontend/pages/index.html
```

## 换电脑运行

1. 安装 Python、MySQL、Neo4j。
2. 复制 `haihe-water-platform/backend/.env.example` 为 `haihe-water-platform/backend/.env`。
3. 按新电脑环境填写数据库和数据路径配置：
   `SANDBOX_DATA_ROOT`、`IMPORT_DATA_DIR`、`IMPORT_CSV_PATH`、`COORDINATE_CSV_PATH`、`NEO4J_DBMS_HOME`、`NEO4J_JAVA_HOME`
4. 在 `haihe-water-platform/backend` 执行 `pip install -r requirements.txt`。
5. 启动 MySQL、Neo4j 后，运行 `haihe-water-platform/start_server.bat`。
6. 如果要让局域网内其他电脑访问，把浏览器地址里的 `127.0.0.1` 换成这台电脑的局域网 IP。

## 说明

- 主要运行入口是 `haihe-water-platform/backend/app.py`。
- `backend` 目录里保留了数据导入和初始化脚本，方便后续重建数据库或图谱。
- `sandbox` 相关页面依赖本地预测结果数据；如果换了机器，需要同步检查 `backend/utils/sandbox_validation.py` 和相关导入脚本中的数据路径配置。

## GitHub Pages 静态部署

- 静态发布使用 `scripts/build-github-pages.ps1` 生成 `docs/`。
- GitHub Actions 工作流位于 `.github/workflows/deploy-pages.yml`，推送到 `main` 后会自动部署到 GitHub Pages。
- 第一次使用时，需要在仓库 `Settings -> Pages` 里把发布源切换为 `GitHub Actions`。
- 如果后端已经部署，把 `haihe-water-platform/frontend/config/site.config.js` 里的 `apiBaseUrl` 改成后端地址再推送。
