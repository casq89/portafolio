# Portfolio

Personal portfolio in a monorepo: `frontend/` (React + Vite + TypeScript) and `backend/` (Node + Express + TypeScript). Each folder has its own `package.json`. There are no root workspaces, so run commands inside each folder.

## Commands

Frontend (`cd frontend`):
- `npm run dev`: Vite dev server
- `npm run build`: `tsc -b && vite build`, outputs to `dist/`
- `npm run lint`: ESLint

Backend (`cd backend`):
- `npm run dev`: `tsx watch src/server.ts`
- `npm run build`: compiles with `tsc` to `dist/`
- `npm start`: runs `dist/server.js`
- Requires a running Redis instance (default `redis://127.0.0.1:6379`)

There are no tests yet.

## Architecture

- **Frontend**: React 19 SPA, rendered on the client. Entry point: `src/main.tsx` → `src/App.tsx`.
  - Single page: `components/Layout.tsx` (Navbar + Footer) wraps the sections `Hero`, `Projects`, `Demos`, `Experience`, `Contact` in `src/components/`.
  - Content (projects, jobs, links) lives typed in `src/data/portfolio.ts`; components only render it.
  - Styling: Tailwind CSS 4 via `@tailwindcss/vite`, no config file. Design tokens (colors, fonts, offset shadows) are defined in `@theme` in `src/index.css`; use those utilities (`bg-surface`, `text-muted`, `shadow-layer`…) instead of raw hex values.
  - TypeScript is pinned to `~6.0` because `typescript-eslint` does not support TypeScript 7 yet. Do not upgrade it until it does.
- **Backend**: everything currently lives in `src/server.ts`:
  - Express 5 with REST routes under `/api` (`GET /api/health`, `POST /api/tasks`)
  - Socket.IO to notify the client (`task:completed` event)
  - BullMQ + ioredis for the `tasks` queue
- **Communication**: in development, Vite proxies `/api` and `/socket.io` (WebSocket) to `http://127.0.0.1:3000` (see `frontend/vite.config.ts`). The frontend uses relative paths (`/api/...`), never the full backend URL.
- **Backend config** comes from environment variables: `PORT` (3000), `HOST` (127.0.0.1) and `REDIS_URL`.

## Deployment

GitHub Actions in `.github/workflows/` run on push to `main`, depending on which folder changed:
- `deploy.yml`: builds the frontend and rsyncs it to `/var/www/portafolio/` on the VPS
- `deploy-backend.yml`: builds the backend, rsyncs it to `/srv/backend/` and runs `systemctl restart backend`
- VPS credentials live in GitHub secrets (`dev` environment). Never put them in the code.

## Conventions

- TypeScript in `strict` mode. Avoid `any`; type props, payloads and Socket.IO events.
- React components in PascalCase, one component per file (`.tsx`). Each component gets its own folder in `src/components/`: `Name/index.tsx` holds the component itself as the default export (no separate `Name.tsx`). Import it by folder (`'./components/Name'`).
- The backend uses ESM (`"type": "module"`, `NodeNext`).
- Everything in the code is in English: file and folder names, identifiers, domain names (`tasks`, `message`), routes, Socket.IO events, comments and all UI copy.
- Commit messages are in Spanish.
- Environment variables go in `.env` (already in `.gitignore`), never in the code.

## Working rules

- Do not `git push` or merge into `main` without asking: a push to `main` deploys to production.
- Run `npm run lint` and `npm run build` in the affected folder before considering a task done.
- Do not edit `dist/` or `node_modules/`.
- Work on branches and open PRs into `main`.
