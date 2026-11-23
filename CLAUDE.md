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
  - Routing with `react-router` (`BrowserRouter` in `main.tsx`, routes in `App.tsx`). `App.tsx` renders `components/Layout` (Navbar + Footer) around the current screen. Screens: `/` → `screens/Home` (renders `Hero`, `Projects`, `Demos`, `Contact`), `/konecta` → `screens/Konecta` (KCRM case study), `/invitation-homes` → `screens/InvitationHomes` and `/british-airways` → `screens/BritishAirways` (mobile app case studies), `/hobbies` → `screens/Hobbies` (content in `data/hobbies.ts`). Unknown paths redirect to `/`.
  - Links to home sections use `/#section` with `<Link>`; `Layout` scrolls to the hash (or to the top) on every navigation. Use `<Link>` for internal routes, never `<a href>`.
  - A project with a `route` in `data/portfolio.ts` makes its whole card link to that screen. Case-study content lives in its own data file typed with `data/caseStudy.ts` (e.g. `data/konecta.ts`, `data/britishAirways.ts`); images go in `src/assets/<project>/`.
  - Content (projects, nav and social links, `profile` and `skills`) lives typed in `src/data/portfolio.ts`; components only render it.
  - The navbar "Download CV" button generates the PDF in the browser with `@react-pdf/renderer` (lazy-loaded on click) from that same data plus `data/hobbies.ts`, using the current accent color. The document is `components/Navbar/components/DownloadCvButton/components/CvDocument`.
  - Styling: Tailwind CSS 4 via `@tailwindcss/vite`, no config file. Design tokens (colors, fonts, offset shadows) are defined in `@theme` in `src/index.css`; use those utilities (`bg-surface`, `text-muted`, `shadow-layer`…) instead of raw hex values.
  - The accent color is switchable at runtime (Navbar `AccentPicker`, options in `data/accents.ts`, applied by `lib/accent.ts` and saved in `localStorage`). Text on an accent background must use `text-on-accent`, never `text-canvas`, so it stays readable on every accent.
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
