# 海河六域项目

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

## 说明

- 主要运行入口是 `haihe-water-platform/backend/app.py`。
- `backend` 目录里保留了数据导入和初始化脚本，方便后续重建数据库或图谱。
- `sandbox` 相关页面依赖本地预测结果数据；如果换了机器，需要同步检查 `backend/utils/sandbox_validation.py` 和相关导入脚本中的数据路径配置。