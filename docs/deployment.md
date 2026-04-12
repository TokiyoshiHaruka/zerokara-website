# Deployment

## Local Docker

```sh
cp .env.example .env
docker compose up -d --build
docker compose exec api npm run init-db
```

Open `http://localhost:8080`.

## 1Panel / Nginx

The production layout used by `zerokara.pro` is:

- Static frontend served by Nginx/OpenResty.
- Node API listening on port `3000`.
- `/api/*` proxied from Nginx to the Node API.
- MySQL stores users, activities, schedules, bug reports, and logs.

Use `deploy/nginx/default.conf` as a baseline. For HTTPS deployments, terminate TLS in your reverse proxy and keep the Node service private.

## Required Environment Variables

Use strong production values:

- `MYSQL_PASSWORD`
- `JWT_SECRET`
- `ZERO_ADMIN_PASSWORD`

Never commit `.env` or production secrets.
