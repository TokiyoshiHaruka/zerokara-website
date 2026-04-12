# API Reference

The backend is an Express service backed by MySQL. In production the frontend calls the API through `/api/*`, with Nginx proxying requests to the Node service.

## Public

- `GET /health` or `GET /api/health`: service health check.
- `GET /api/public/activities`: published activities.
- `GET /api/schedule-events`: public schedule events.
- `POST /api/bugs`: submit a bug report.
- `POST /api/login`: login and receive a bearer token.

## Admin

Admin routes require `Authorization: Bearer <token>` and an admin user.

- `GET /api/admin/activities`
- `POST /api/admin/activities`
- `PUT /api/admin/activities/:id`
- `DELETE /api/admin/activities/:id`
- `GET /api/admin/schedule-events`
- `POST /api/admin/schedule-events`
- `PUT /api/admin/schedule-events/:id`
- `DELETE /api/admin/schedule-events/:id`
- `GET /api/admin/users`
- `POST /api/admin/users`
- `PUT /api/admin/users/:id`
- `DELETE /api/admin/users/:id`
- `GET /api/admin/bugs`
- `PUT /api/admin/bugs/:id`
- `GET /api/admin/stats/summary`
- `GET /api/admin/stats/visits`
- `GET /api/admin/stats/logs`
