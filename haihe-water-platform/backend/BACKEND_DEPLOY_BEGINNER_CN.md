# 后端部署傻瓜步骤

这套项目的后端最适合用下面这个组合：

- 后端服务：Railway
- MySQL：Railway MySQL
- Neo4j：Neo4j AuraDB

原因很简单：

- 你的代码已经是 Flask + MySQL + Neo4j
- Railway 可以直接从 GitHub 拉代码部署 Flask
- Railway 官方文档支持从 GitHub 部署 Flask，也支持直接创建 MySQL 数据库
- Neo4j 官方提供 AuraDB 托管服务，适合这个项目的图数据库部分

## 一句话路线

1. 在 Railway 创建项目
2. 先加一个 MySQL 数据库
3. 再把 `haihe-water-platform/backend` 这个后端目录部署成一个服务
4. 把 MySQL 的连接信息填到后端环境变量
5. 如果你要知识图谱功能，再去 Neo4j AuraDB 创建一个免费实例
6. 拿到 Railway 给你的域名后，回到前端 `site.config.js` 填进去

## 你现在的 GitHub 仓库

仓库地址：

- [Apollolxz/haihe-water-platform](https://github.com/Apollolxz/haihe-water-platform)

后端目录：

- `haihe-water-platform/backend`

前端静态发布目录：

- `docs`

## 第 1 步：注册 Railway

官方入口：

- [Railway Flask 部署指南](https://docs.railway.com/guides/flask)
- [Railway 价格说明](https://docs.railway.com/pricing)

按官方文档，Railway 支持：

- 从 GitHub 仓库直接部署 Flask
- 在项目里直接添加 MySQL

## 第 2 步：在 Railway 建项目

在 Railway 里这样点：

1. 登录 Railway
2. 点击 `New Project`
3. 先不要急着直接部署代码
4. 先创建一个空项目，或者创建项目后继续往里面加服务

## 第 3 步：先创建 MySQL

官方文档：

- [Railway MySQL 文档](https://docs.railway.com/databases/mysql)

在 Railway 项目里：

1. 点击 `+ New`
2. 选择 `Database`
3. 选择 `MySQL`

建好以后，你会看到 MySQL 服务。

Railway 官方文档列出的 MySQL 变量包括：

- `MYSQLHOST`
- `MYSQLPORT`
- `MYSQLUSER`
- `MYSQLPASSWORD`
- `MYSQLDATABASE`

## 第 4 步：部署 Flask 后端

官方文档：

- [Railway Flask 指南](https://docs.railway.com/guides/flask)
- [Railway Monorepo 根目录说明](https://docs.railway.com/guides/monorepo)
- [Railway Start Command](https://docs.railway.com/guides/start-command)

因为你的仓库是“外层仓库 + 内层项目目录”的结构，所以在 Railway 里一定要设置根目录。

你要填的后端根目录是：

```text
/haihe-water-platform/backend
```

在 Railway 中操作：

1. 点击 `+ New`
2. 选择 `GitHub Repo`
3. 选择你的仓库 `Apollolxz/haihe-water-platform`
4. 打开这个后端服务的 `Settings`
5. 找到 `Root Directory`
6. 填入：

```text
/haihe-water-platform/backend
```

7. 找到 `Start Command`
8. 填入：

```text
gunicorn app:app
```

这个项目我已经改好了，会优先读取云平台提供的 `PORT`，所以 Railway 可以正常启动。

## 第 5 步：给后端填环境变量

官方文档：

- [Railway Variables](https://docs.railway.com/variables)

你的后端需要这些变量，名字和项目代码一致：

```env
MYSQL_HOST=
MYSQL_PORT=
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_DATABASE=

SECRET_KEY=

NEO4J_URI=
NEO4J_USER=
NEO4J_PASSWORD=
NEO4J_DATABASE=

DEEPSEEK_API_KEY=
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions

FLASK_HOST=0.0.0.0
FLASK_PORT=5001
FLASK_DEBUG=false
```

最重要的是先把 MySQL 的 5 个变量填好。

你可以这样对应填写：

- `MYSQL_HOST` = Railway MySQL 的 `MYSQLHOST`
- `MYSQL_PORT` = Railway MySQL 的 `MYSQLPORT`
- `MYSQL_USER` = Railway MySQL 的 `MYSQLUSER`
- `MYSQL_PASSWORD` = Railway MySQL 的 `MYSQLPASSWORD`
- `MYSQL_DATABASE` = Railway MySQL 的 `MYSQLDATABASE`

`SECRET_KEY` 你可以先随便放一个长一点的随机字符串，比如：

```text
haihe-2026-please-change-this-secret-key
```

## 第 6 步：先拿到后端网址

后端部署成功后：

1. 打开 Railway 后端服务
2. 进入 `Settings`
3. 找到 `Networking`
4. 点击 `Generate Domain`

Railway 官方 Flask 指南里也写了这一步。

生成后，你会得到一个类似下面的地址：

```text
https://xxxx.up.railway.app
```

这就是你的“后端 URL”。

## 第 7 步：把这个后端地址填回前端

打开这个文件：

- [site.config.js](/D:/软件/知识图谱网站%20-%20副本%20(27)%20-%20副本/haihe-water-platform/frontend/config/site.config.js:1)

把这行：

```js
apiBaseUrl: ''
```

改成：

```js
apiBaseUrl: 'https://你的后端域名'
```

比如：

```js
apiBaseUrl: 'https://haihe-api.up.railway.app'
```

然后重新生成 GitHub Pages 文件：

```powershell
.\scripts\build-github-pages.ps1
```

再推送到 GitHub。

## 第 8 步：如果你要知识图谱功能，再配 Neo4j

官方文档：

- [Neo4j AuraDB](https://neo4j.com/auradb)
- [Neo4j Aura 连接应用](https://neo4j.com/docs/aura/connecting-applications/overview/)
- [Neo4j Aura 获取连接信息](https://neo4j.com/docs/aura/getting-started/connect-instance/)

Neo4j 官方文档说明，连接外部应用时你需要：

- URI
- username
- password

在 AuraDB 创建实例后，把它们填到 Railway 后端变量：

```env
NEO4J_URI=neo4j+s://xxxx.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=你的密码
NEO4J_DATABASE=neo4j
```

如果你这一步先不做：

- 后端服务也可以先上线
- 但知识图谱/溯源相关功能可能不可用

## 第 9 步：如果你要聊天功能，再配 DeepSeek

这个项目聊天接口依赖：

- `DEEPSEEK_API_KEY`
- `DEEPSEEK_MODEL`：先填 `deepseek-v4-flash`
- `DEEPSEEK_API_URL`：填 `https://api.deepseek.com/chat/completions`

如果不填：

- 后端也能启动
- 但聊天功能会报“未配置密钥”

## 最适合你的顺序

第一次上线，建议你只做这三件事：

1. Railway MySQL
2. Railway Flask 后端
3. 前端 `site.config.js` 填后端地址

这样你会最快看到网站“真正连上自己的后端”。

Neo4j 和 DeepSeek 可以等网站先跑起来以后再补。
