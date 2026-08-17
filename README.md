# ZEROKARA Website

**语言 / Language / 言語**: [中文](#中文) | [日本語](#日本語) | [English](#english)

---

## 中文

ZEROKARA Website 是 ZERO / ZEROKARA 的官方网站与后台 API 项目。仓库包含官网静态页面、活动与日程展示、BUG 反馈、后台管理页面、Node.js 后端 API、MySQL 数据表初始化脚本，以及 Docker / Nginx 部署示例。

线上站点: https://zerokara.pro

### 项目特性

- 多语言官网: 支持日文、繁体中文、英文。
- 官网页面: 首页、活动、日程、加入、联系、登录、BUG 反馈。
- 后台页面: 活动管理、日程管理、BUG 管理、用户管理、统计面板。
- 后端 API: Express + MySQL，使用 JWT 进行后台鉴权。
- 数据库脚本: 自动创建表结构，支持初始化第一个管理员账号。
- 本地部署: 提供 Docker Compose，一条命令启动 MySQL、API 和 Nginx。
- 生产部署参考: 提供 Nginx `/api/*` 反代配置，可接入 1Panel / OpenResty。

### 技术栈

- 前端: HTML, CSS, JavaScript, Vue global runtime。
- 后端: Node.js, Express, MySQL, bcrypt, JSON Web Token。
- 部署: Docker, Docker Compose, Nginx / OpenResty, MySQL。

### 仓库结构

```text
frontend/          官网静态页面、后台页面、前端资源
backend/           Express API、MySQL schema、初始化脚本
deploy/nginx/      Nginx 反向代理示例
docs/              API、资源、部署说明
docker-compose.yml 本地完整运行环境
.env.example       环境变量模板
```

### 快速开始

```sh
cp .env.example .env
docker compose up -d --build
docker compose exec api npm run init-db
```

打开:

- 官网: http://localhost:8080
- API 健康检查: http://localhost:8080/api/health

本地管理员账号由 `.env` 控制:

- `ZERO_ADMIN_USERNAME`
- `ZERO_ADMIN_PASSWORD`

### 手动运行后端

先在完整仓库的根目录创建 `.env`。从完整仓库运行时，后端的 npm 命令会自动读取这个文件；Shell 或容器已经注入的环境变量优先级更高。手动运行时需要另行提供可访问的 MySQL 实例。只部署 `backend` 目录时不会向父目录查找 `.env`，请由进程管理器注入环境变量。

`TRUST_PROXY_HOPS` 必须设置为客户端与 Express 之间受信任反向代理的准确跳数。客户端直接访问 Express 时保持为 `0`；本仓库的 Docker Compose 通过一个 Nginx 代理访问 API，因此设置为 `1`。

```sh
cp .env.example .env
cd backend
npm ci
npm test
npm run ensure-schema
npm run init-db
npm start
```

### 环境变量

复制 `.env.example` 为 `.env`，并在真实部署前修改所有占位值。

核心变量:

- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `JWT_SECRET`
- `ZERO_ADMIN_USERNAME`
- `ZERO_ADMIN_PASSWORD`

### 媒体资源说明

仓库没有包含生产环境音乐文件、WAV 母带和原始大视频，以避免仓库过大以及潜在版权问题。资源替换方式见 [docs/assets.md](docs/assets.md)。

### API 文档

详见 [docs/api.md](docs/api.md)。

### 部署说明

详见 [docs/deployment.md](docs/deployment.md)。

AI 辅助维护范围见 [AI_USAGE.md](AI_USAGE.md)。

### 安全说明

- 不要提交 `.env`、TLS 证书、私钥、数据库 dump 或生产日志。
- 生产环境必须使用长随机 `JWT_SECRET`。
- 初始化管理员后请立即修改默认密码。
- API 建议只通过 Nginx / OpenResty 反向代理暴露。

### 许可证

MIT License. 详见 [LICENSE](LICENSE)。

---

## 日本語

ZEROKARA Website は、ZERO / ZEROKARA の公式サイトとバックエンド API をまとめたオープンソースプロジェクトです。静的フロントエンド、活動・スケジュール表示、バグ報告、管理画面、Node.js API、MySQL 初期化スクリプト、Docker / Nginx のデプロイ例を含みます。

公開サイト: https://zerokara.pro

### 主な機能

- 多言語サイト: 日本語、繁体字中国語、英語。
- ページ: ホーム、活動、スケジュール、参加案内、問い合わせ、ログイン、バグ報告。
- 管理画面: 活動、スケジュール、バグ、ユーザー、統計。
- API: Express + MySQL、JWT による管理者認証。
- ローカル実行: Docker Compose で MySQL、API、Nginx を起動。
- デプロイ例: Nginx の `/api/*` リバースプロキシ設定。

### 技術スタック

- Frontend: HTML, CSS, JavaScript, Vue global runtime。
- Backend: Node.js, Express, MySQL, bcrypt, JSON Web Token。
- Deployment: Docker, Docker Compose, Nginx / OpenResty, MySQL。

### クイックスタート

```sh
cp .env.example .env
docker compose up -d --build
docker compose exec api npm run init-db
```

アクセス:

- Website: http://localhost:8080
- API health check: http://localhost:8080/api/health

### バックエンド開発

完全なリポジトリから実行する場合、リポジトリ直下の `.env` は以下の npm コマンドから自動的に読み込まれます。シェルやコンテナで設定済みの環境変数は上書きされません。`backend` ディレクトリだけを配置した環境では親ディレクトリの `.env` を検索しないため、プロセスマネージャーから環境変数を設定してください。手動実行時は、接続可能な MySQL を別途用意してください。

`TRUST_PROXY_HOPS` には、クライアントと Express の間にある信頼済みリバースプロキシの正確なホップ数を設定してください。Express に直接接続する場合は `0` のままにし、このリポジトリの Docker Compose は Nginx を 1 台経由するため `1` を使用します。

```sh
cp .env.example .env
cd backend
npm ci
npm test
npm run ensure-schema
npm run init-db
npm start
```

### ドキュメント

- API: [docs/api.md](docs/api.md)
- Assets: [docs/assets.md](docs/assets.md)
- Deployment: [docs/deployment.md](docs/deployment.md)
- AI-assisted maintenance: [AI_USAGE.md](AI_USAGE.md)
- License: [LICENSE](LICENSE)

### 注意事項

本番環境の音楽ファイル、WAV マスター、元サイズの動画は含まれていません。必要なメディアはライセンスを確認したうえで追加してください。

---

## English

ZEROKARA Website is the official website and backend API project for ZERO / ZEROKARA. It includes the static frontend, activity and schedule pages, bug reporting, admin screens, a Node.js API, MySQL schema scripts, and Docker / Nginx deployment examples.

Live site: https://zerokara.pro

### Features

- Multilingual website: Japanese, Traditional Chinese, and English.
- Pages: home, activities, schedule, join, contact, login, and bug reports.
- Admin screens: activities, schedules, bugs, users, and statistics.
- Backend API: Express + MySQL with JWT-based admin authentication.
- Local runtime: Docker Compose starts MySQL, API, and Nginx.
- Deployment example: Nginx reverse proxy for `/api/*`.

### Tech Stack

- Frontend: HTML, CSS, JavaScript, Vue global runtime.
- Backend: Node.js, Express, MySQL, bcrypt, JSON Web Token.
- Deployment: Docker, Docker Compose, Nginx / OpenResty, MySQL.

### Quick Start

```sh
cp .env.example .env
docker compose up -d --build
docker compose exec api npm run init-db
```

Open:

- Website: http://localhost:8080
- API health check: http://localhost:8080/api/health

### Backend Development

When run from a full repository checkout, the backend npm commands automatically read `.env` from the repository root. Values already supplied by the shell or container take precedence. A standalone `backend` deployment does not search parent directories for `.env`; inject its environment through the process manager instead. A reachable MySQL instance must be provided separately when running the backend directly on the host.

Set `TRUST_PROXY_HOPS` to the exact number of trusted reverse-proxy hops between the client and Express. Keep it at `0` when clients reach Express directly; this repository's Docker Compose uses `1` because requests pass through one Nginx proxy.

```sh
cp .env.example .env
cd backend
npm ci
npm test
npm run ensure-schema
npm run init-db
npm start
```

### Documentation

- API: [docs/api.md](docs/api.md)
- Assets: [docs/assets.md](docs/assets.md)
- Deployment: [docs/deployment.md](docs/deployment.md)
- AI-assisted maintenance: [AI_USAGE.md](AI_USAGE.md)
- License: [LICENSE](LICENSE)

### Notes

Production music files, WAV masters, and the original full-size video are not included. Add your own licensed media before deploying a customized version.
