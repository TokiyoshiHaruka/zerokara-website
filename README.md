# ZEROKARA Website

ZEROKARA Website is the official website and backend API for ZERO. It includes a multilingual static frontend, public activity and schedule pages, bug reporting, admin management screens, and a Node.js API backed by MySQL.

Live site: https://zerokara.pro

## Features

- Multilingual frontend: Japanese, Traditional Chinese, and English.
- Home, activity, schedule, join, contact, login, and bug report pages.
- Admin pages for activities, schedules, users, bugs, and statistics.
- Express API with JWT-based admin authentication.
- MySQL schema creation and admin bootstrap scripts.
- Docker Compose setup for local development and self-hosting.
- Nginx reverse proxy example for `/api/*`.

## Tech Stack

- Frontend: HTML, CSS, JavaScript, Vue global runtime.
- Backend: Node.js, Express, MySQL, bcrypt, JSON Web Token.
- Deployment: Docker, Nginx/OpenResty, MySQL.

## Repository Layout

```text
frontend/          Static website and admin pages
backend/           Express API and MySQL schema scripts
deploy/nginx/      Nginx reverse proxy example
docs/              API, asset, and deployment documentation
docker-compose.yml Local full-stack runtime
.env.example       Example local environment variables
```

## Quick Start

```sh
cp .env.example .env
docker compose up -d --build
docker compose exec api npm run init-db
```

Open:

- Website: http://localhost:8080
- API health check: http://localhost:8080/api/health

Default local admin credentials come from your `.env` values:

- `ZERO_ADMIN_USERNAME`
- `ZERO_ADMIN_PASSWORD`

## Manual Backend Setup

```sh
cd backend
npm install --production
MYSQL_HOST=127.0.0.1 MYSQL_PASSWORD=change-me JWT_SECRET=change-me npm run ensure-schema
ZERO_ADMIN_PASSWORD=change-me-admin-password npm run init-db
npm start
```

## Configuration

Copy `.env.example` to `.env` and change every placeholder value before running a real deployment.

Important variables:

- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `JWT_SECRET`
- `ZERO_ADMIN_USERNAME`
- `ZERO_ADMIN_PASSWORD`

## Media Assets

Production music files, WAV masters, and the original full-size background video are not included. See [docs/assets.md](docs/assets.md) for the replacement policy and playlist example.

## API

See [docs/api.md](docs/api.md).

## Deployment

See [docs/deployment.md](docs/deployment.md).

## Security Notes

- Never commit `.env`, TLS certificates, private keys, database dumps, or production logs.
- Use a long random `JWT_SECRET` in production.
- Change the first admin password immediately after bootstrap.
- Keep the API behind Nginx or another reverse proxy.

## License

MIT License. See [LICENSE](LICENSE).
