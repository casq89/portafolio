# Portfolio

Personal portfolio in a monorepo: `frontend/` (React + Vite + TypeScript) and `backend/` (Node + Express + TypeScript). Each folder has its own `package.json`. There are no root workspaces, so run commands inside each folder.

## Commands

Frontend (`cd frontend`):
- `npm run dev`: Vite dev server
- `npm run build`: `tsc -b && vite build`, outputs to `dist/`
- `npm run lint`: ESLint

Backend (`cd backend`):
- `npm run dev`: `tsx watch src/server.ts`, loading `backend/.env` if it exists (copy `backend/.env.example`; needed for the contact form)
- `npm run build`: compiles with `tsc` to `dist/`
- `npm start`: runs `dist/server.js`
- `npm run redis`: starts the local Redis container with Docker (creates it the first time); `npm run redis:stop` stops it
- See "Backend local setup" below before running it the first time

There are no tests yet.

## Backend local setup

1. **Redis** (needed by the BullMQ `tasks` queue): Docker Desktop must be open (status "Engine running"). Then run `npm run redis` in `backend/`. It starts the `redis` container, or creates it the first time with `--restart unless-stopped` on port 6379, so it comes back on its own whenever Docker Desktop starts. Check it with `docker ps` (status `Up`).
   - `ECONNREFUSED 127.0.0.1:6379` in the backend console means Redis is not running. The server still starts and keeps retrying, and it connects on its own once Redis is up, without a restart.
   - `error during connect ... dockerDesktopLinuxEngine` means Docker Desktop is not open.
   - The contact form does not depend on Redis: `/api/contact` works without it.
2. **Environment**: copy `backend/.env.example` to `backend/.env` (gitignored) and fill in `RESEND_API_KEY` (use a separate local key, not the production one) and `CONTACT_TO`. `npm run dev` loads it automatically (needs Node 22.9 or later for `--env-file-if-exists`).
3. Run `npm run dev` in `backend/` and in `frontend/`. Vite proxies `/api` and `/socket.io` to the backend.

## Architecture

- **Frontend**: React 19 SPA, rendered on the client. Entry point: `src/main.tsx` → `src/App.tsx`.
  - Routing with `react-router` (`BrowserRouter` in `main.tsx`, routes in `App.tsx`). `App.tsx` renders `components/Layout` (Navbar + Footer) around the current screen. Screens: `/` → `screens/Home` (renders `Hero`, `Projects`, `Demos`, `Contact`), `/konecta` → `screens/Konecta` (KCRM case study), `/invitation-homes` → `screens/InvitationHomes` and `/british-airways` → `screens/BritishAirways` (mobile app case studies), `/hobbies` → `screens/Hobbies` (content in `data/hobbies.ts`). Unknown paths redirect to `/`.
  - Links to home sections use `/#section` with `<Link>`; `Layout` scrolls to the hash (or to the top) on every navigation. Use `<Link>` for internal routes, never `<a href>`.
  - A project with a `route` in `data/portfolio.ts` makes its whole card link to that screen. Case-study content lives in its own data file typed with `data/caseStudy.ts` (e.g. `data/konecta.ts`, `data/britishAirways.ts`); images go in `src/assets/<project>/`.
  - Content (projects, nav and social links, `profile` and `skills`) lives typed in `src/data/portfolio.ts`; components only render it.
  - The navbar "Download CV" button generates the PDF in the browser with `@react-pdf/renderer` (lazy-loaded on click) from that same data (each project's `cv` entry for the experience), using the current accent color. The document is `components/Navbar/components/DownloadCvButton/components/CvDocument`.
  - Styling: Tailwind CSS 4 via `@tailwindcss/vite`, no config file. Design tokens (colors, fonts, offset shadows) are defined in `@theme` in `src/index.css`; use those utilities (`bg-surface`, `text-muted`, `shadow-layer`…) instead of raw hex values.
  - The accent color is switchable at runtime (Navbar `AccentPicker`, options in `data/accents.ts`, applied by `lib/accent.ts` and saved in `localStorage`). Text on an accent background must use `text-on-accent`, never `text-canvas`, so it stays readable on every accent.
  - TypeScript is pinned to `~6.0` because `typescript-eslint` does not support TypeScript 7 yet. Do not upgrade it until it does.
- **Backend**: `src/server.ts` wires everything together:
  - Express 5 with REST routes under `/api` (`GET /api/health`, `POST /api/tasks`, `POST /api/contact`), Socket.IO and the shared ioredis connection
  - `src/contact.ts`: the contact form route. It validates the payload, ignores bots through a hidden `website` honeypot field, rate-limits in memory (5 per IP per hour) and sends the email through the Resend HTTP API (`fetch`, no SDK) to `CONTACT_TO`, with `Reply-To` set to the visitor. It does not use Redis or BullMQ, on purpose: keep it that way.
  - `src/tasks.ts`: the task queue demo (home "Demos" section, `screens/Home/components/Demos/components/TaskQueueDemo`). BullMQ `tasks` queue with a worker (concurrency 2, 3 attempts with exponential backoff, ~20% of attempts fail on purpose). `POST /api/tasks` with `{ count: 1..10 }` enqueues tasks (rate limit 30 per IP per minute, at most 60 pending overall). Every state change is broadcast to all browsers over Socket.IO (`task:waiting`, `task:active`, `task:progress`, `task:retrying`, `task:completed`, `task:failed`, each with a `TaskView`), and each new connection first gets `tasks:snapshot`. The event types are mirrored by hand in `frontend/src/lib/socket.ts` (shared, lazily created socket): keep both in sync.
- **Communication**: in development, Vite proxies `/api` and `/socket.io` (WebSocket) to `http://127.0.0.1:3000` (see `frontend/vite.config.ts`). The frontend uses relative paths (`/api/...`), never the full backend URL.
- **Backend config** comes from environment variables: `PORT` (3000), `HOST` (127.0.0.1), `REDIS_URL`, plus `RESEND_API_KEY`, `CONTACT_TO` and optional `CONTACT_FROM` for the contact form (without them `/api/contact` answers 503).

## Deployment

GitHub Actions in `.github/workflows/` run on push to `main`, depending on which folder changed:
- `deploy.yml`: builds the frontend and rsyncs it to `/var/www/portafolio/` on the VPS
- `deploy-backend.yml`: builds the backend, rsyncs it to `/srv/backend/` and runs `systemctl restart backend`
- VPS credentials live in GitHub secrets (`dev` environment). Never put them in the code.

## Server (VPS) and email

- Caddy serves the frontend and proxies `/api` and `/socket.io` to the backend, which runs as the systemd service `backend` with secrets in `/etc/backend.env`. Redis runs on the same VPS. Details, commands and the reference copies in `deploy/`: `docs/server.md`.
- There is no mail server: Cloudflare Email Routing receives `contacto@casq89.com` and forwards it to Gmail, and Resend sends (contact form and Gmail replies). Setup, DNS records and troubleshooting: `docs/email.md`.
- The repo is public: never write secrets, the VPS IP or the SSH user (the `VPS_USER` secret) in it.

## Conventions

- TypeScript in `strict` mode. Avoid `any`; type props, payloads and Socket.IO events.
- React components in PascalCase, one component per file (`.tsx`). Each component gets its own folder whose `index.tsx` holds the component itself as the default export (no separate `Name.tsx`):
  - `src/screens/<Screen>/`: one folder per screen (`Home`, `Konecta`, `InvitationHomes`, `BritishAirways`, `Hobbies`). The screen's own components go in `screens/<Screen>/components/` (e.g. `screens/Home/components/Hero`).
  - `src/components/`: general components shared across screens (`Layout`, `Navbar`, `Footer`, `Logo`, `SectionHeader`, `Window`, `BackLink` (breadcrumb back link at the top of inner screens), and for case-study screens `CaseHero`, `FeatureRow`, plus `PhoneShot`, `PhoneFan` and `PhonePair` for app screenshots).
  - The same rule nests: a component used by only one component lives inside it, in `<Parent>/components/<Name>/` (e.g. `screens/Home/components/Projects/components/ProjectCard`). When a second screen or component needs it, move it up to the closest shared `components/` folder, or to `src/components/`.
- Import components by folder (`'./components/Name'`).
- The backend uses ESM (`"type": "module"`, `NodeNext`).
- Everything in the code is in English: file and folder names, identifiers, domain names (`tasks`, `message`), routes, Socket.IO events, comments and all UI copy.
- Commit messages are in Spanish.
- Environment variables go in `.env` (already in `.gitignore`), never in the code.

## Working rules

- Do not `git push` or merge into `main` without asking: a push to `main` deploys to production.
- Run `npm run lint` and `npm run build` in the affected folder before considering a task done.
- Do not edit `dist/` or `node_modules/`.
- Work on branches and open PRs into `main`.
