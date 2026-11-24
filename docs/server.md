# Server (VPS)

How the production VPS is set up. The repo does not provision the server: the files in `deploy/` are reference copies of what is on it, kept in sync by hand. This repo is public, so never write secrets, the VPS IP or the SSH user here.

## Overview

```
visitor ──HTTPS──> Caddy (:443)
                     ├─ /api/*, /socket.io/*  ──> backend (127.0.0.1:3000) ──> Redis (127.0.0.1:6379)
                     └─ everything else       ──> /var/www/portafolio (frontend build)
```

Deploys are done by GitHub Actions (see "Deployment" in `CLAUDE.md`): the frontend build goes to `/var/www/portafolio/`, the backend build to `/srv/backend/`, followed by `systemctl restart backend`.

## Caddy

- Config: `/etc/caddy/Caddyfile` (copy: `deploy/Caddyfile`).
- Domains: `casq89.com` and `www.casq89.com`. Caddy obtains and renews the HTTPS certificates automatically; there is no certbot.
- `/api/*` and `/socket.io/*` → `reverse_proxy 127.0.0.1:3000` (backend, including the WebSocket).
- Everything else → static files from `/var/www/portafolio`, with `try_files {path} /index.html` so `BrowserRouter` routes work on reload.
- Responses are compressed with `encode gzip`.
- A new backend route prefix outside `/api` or `/socket.io` needs a new `handle` block.

Changing it:

```bash
sudo nano /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Then update `deploy/Caddyfile` in the repo.

## Backend service (systemd)

- Unit: `/etc/systemd/system/backend.service` (copy: `deploy/backend.service`, with the user replaced by `<vps-user>`).
- Runs `/usr/bin/node dist/server.js` from `/srv/backend` as the deploy user (the `VPS_USER` GitHub secret), with `Restart=always`, `RestartSec=3` and `MemoryMax=768M`.
- Starts after Redis (`After=`/`Wants=redis-server.service`).
- Environment: `NODE_ENV=production` plus `EnvironmentFile=/etc/backend.env`.
- `PORT`, `HOST` and `REDIS_URL` are not set, so the defaults in `server.ts` apply (`127.0.0.1:3000`, local Redis). The backend is therefore only reachable through Caddy.

### Secrets: `/etc/backend.env`

Root-owned, `chmod 600`. Template: `deploy/backend.env.example`.

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Resend API key for the contact form (production key) |
| `CONTACT_TO` | Inbox that receives contact form messages |
| `CONTACT_FROM` | Optional sender, defaults to `Portfolio <contacto@casq89.com>` |

If the file is missing, the service fails to start. New variables go here (and in the example file), never in the code.

### Useful commands

```bash
systemctl status backend --no-pager
journalctl -u backend -f                                   # live logs
sudo systemctl daemon-reload && sudo systemctl restart backend   # after editing the unit or /etc/backend.env
```

## Redis

Runs on the same VPS as the `redis-server` service, on `127.0.0.1:6379`. Used only by the BullMQ `tasks` queue; the contact form does not use it.

## Email

There is no mail server on the VPS. See `docs/email.md`.
