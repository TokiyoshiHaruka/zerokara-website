# ZERO API / MySQLA Setup

## 服务器目录

- ZERO API: `/opt/1panel/apps/mysql/zero-api`
- 站点静态文件: `/opt/1panel/www/sites/zerokara.pro/index`

## 推荐做法

1. 把 `zero-api` 最新文件同步到 `/opt/1panel/apps/mysql/zero-api`
2. 进入该目录后执行：

```bash
cd /opt/1panel/apps/mysql/zero-api
npm install --production
npm run ensure-schema
npm run init-db
```

3. 确认环境变量至少包含：

```bash
MYSQL_HOST=mysqla
MYSQL_PORT=3306
MYSQL_DATABASE=zero_site
MYSQL_USER=zero_user
MYSQL_PASSWORD=你的数据库密码
JWT_SECRET=请改成你自己的长随机串
```

4. 重启 `zero-api`

## 如果你想用 phpMyAdmin 手动建表

1. 打开数据库 `zero_site`
2. 导入文件 `sql/mysqla-bootstrap.sql`
3. 导入完成后，仍建议再执行一次：

```bash
cd /opt/1panel/apps/mysql/zero-api
npm run ensure-schema
```

这样可以把已有旧表缺的字段补齐。

## 现在前后端会使用的接口

- 登录: `/api/login`
- 前台 BUG 提交: `/api/bugs`
- 后台 BUG 管理: `/api/admin/bugs`, `/api/admin/bugs/:id`, `/api/admin/bugs/stats/overview`
- 前台活动: `/api/public/activities`
- 前台日程: `/api/schedule-events`
- 后台活动管理: `/api/admin/activities`
- 后台日程管理: `/api/admin/schedule-events`
- 后台用户管理: `/api/admin/users`
- 后台统计: `/api/admin/stats/summary`, `/api/admin/stats/visits`, `/api/admin/stats/logs`

## 反向代理建议

请确保 Nginx / 1Panel 至少把 `/api/` 整个前缀都转发到 Node 的 ZERO API。
这样就不会和 `/admin/*.html` 的静态后台页面路径冲突。
