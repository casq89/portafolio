# Task queue demo

The first live demo on the home page (`/#demos`, card "Task queue"). Visitors send fake tasks to the backend, Redis holds them in a BullMQ queue, a worker processes them two at a time, and every state change is pushed to every open browser over Socket.IO. The board is shared: you see other visitors' tasks too.

The `/queues` screen ("How I built it" button on the card) is a step-by-step tutorial of this same code for visitors. This file is the reference for developers.

## Overview

```
                 POST /api/tasks { count }
  Browser ───────────────────────────────────▶ Express (/api/tasks)
     ▲            { ids }  (~5 ms)                │  queue.addBulk()
     │◀───────────────────────────────────────────┤
     │                                            ▼
     │                                     Redis ("tasks" queue)
     │                                            │  next job, when a slot is free
     │                                            ▼
     │   Socket.IO (io.emit, all browsers)   Worker (concurrency 2)
     └◀═══════════════════════════════════════════╛
         task:waiting / active / progress / retrying / completed / failed
```

1. The browser calls `POST /api/tasks`. The route only validates, adds the jobs to Redis and answers with their ids. It never does the work itself.
2. The route broadcasts `task:waiting` for each new job.
3. The worker picks jobs from Redis as slots free up and emits `active`, `progress`, `completed` or `failed`. Each worker event is re-sent to every browser as a Socket.IO event.
4. A failed attempt with attempts left goes back into the queue (BullMQ handles the backoff) and is announced as `task:retrying`. Only the last failed attempt is `task:failed`.
5. Each new socket connection first gets `tasks:snapshot` (the current board) and `queue:info` (workers and slots).

## Files

| File | What it does |
|---|---|
| `backend/src/server.ts` | Creates Express, the Socket.IO server (typed with `TaskEvents`) and the shared ioredis connection, and mounts `createTasksDemo(io, connection)` on `/api/tasks`. |
| `backend/src/tasks.ts` | Everything in the demo: queue, worker, `POST /api/tasks`, Socket.IO events, snapshot, `queue:info`, limits. Exports the `TaskView`, `QueueInfo` and `TaskEvents` types. |
| `frontend/src/lib/socket.ts` | Single lazily created Socket.IO client (`getSocket()`), shared by all demos, plus a hand-kept copy of the backend event types. |
| `frontend/src/screens/Home/components/Demos/components/TaskQueueDemo/index.tsx` | The card: buttons, the 4 columns, the status in the title bar, the response time message and the link to `/queues`. |
| `.../TaskQueueDemo/useTaskQueue.ts` | Hook: listens to the socket, keeps the board in a `Map` by id, sends tasks and remembers which ids are the visitor's own. |
| `.../TaskQueueDemo/components/TaskCard/index.tsx` | One card: id, owner (`you` / `visitor`), progress bar, retry badge, duration. |
| `frontend/src/screens/Queues/` | The `/queues` tutorial screen (`SequenceDiagram`, `TaskLifecycle`, `StepCard`). |
| `frontend/src/data/queues.ts` | Content of `/queues`: texts, diagram data and code excerpts. |
| `frontend/src/index.css` | `animate-pop-in`, the animation cards play when they appear in a column. |

## Backend

### Settings

All constants are at the top of `backend/src/tasks.ts`. None of them come from environment variables.

| Constant | Value | Meaning |
|---|---|---|
| `QUEUE_NAME` | `tasks` | BullMQ queue name (Redis keys `bull:tasks:*`). |
| `CONCURRENCY` | 2 | Jobs the worker runs at the same time ("slots"). |
| `MAX_ATTEMPTS` | 3 | Attempts per job, with exponential backoff of 1 s, then 2 s. |
| `STEPS` × `STEP_MS` | 5 × 400 ms | A task takes about 2 s and reports progress after each step. |
| `FAILURE_RATE` | 0.2 | Chance that an attempt throws on purpose, so retries are visible. |
| `MAX_BATCH` | 10 | Maximum `count` per request. |
| `MAX_PENDING` | 60 | Waiting + delayed + active jobs allowed at once, across all visitors. |
| `RATE_LIMIT` | 30 per minute | Tasks per IP, counted in memory (resets when the backend restarts). |
| `REDIS_TIMEOUT_MS` | 3000 | Timeout for the route and the snapshot when Redis does not answer. |
| `RECENT_FINISHED` | 6 | Completed / failed jobs sent in the snapshot. |
| `QUEUE_INFO_INTERVAL_MS` | 5000 | How often the worker count is checked. |

Redis only keeps the last 50 completed and 50 failed jobs (`removeOnComplete` / `removeOnFail`), so it does not grow with use. Job ids come from the Redis counter `bull:tasks:id` and never reset unless the Redis data is wiped; in production they work as a "tasks processed so far" counter.

### `POST /api/tasks`

Request body: `{ "count": 1..10 }` (defaults to 1).

| Status | Body | When |
|---|---|---|
| 200 | `{ "ids": ["14", "15"] }` | Jobs added. |
| 400 | `{ "error": "count must be between 1 and 10" }` | Invalid `count`. |
| 429 | `{ "error": "Too many tasks, try again in a minute" }` | Per-IP rate limit. |
| 503 | `{ "error": "The queue is full right now, …" }` | More than `MAX_PENDING` pending jobs. |
| 503 | `{ "error": "The queue is offline right now" }` | Redis did not answer within 3 s. |

The jobs carry no data (`{}`): there is no user content to validate or moderate.

### Socket.IO events (server → client)

All of them are sent to every connected browser (`io.emit`), except the two sent on connection, which go only to the new socket.

| Event | Payload | Sent when |
|---|---|---|
| `queue:info` | `QueueInfo` | On connection, and to everyone when the worker count changes (checked every 5 s). |
| `tasks:snapshot` | `TaskView[]` | On connection (and on every reconnection): active, waiting, delayed and the latest finished jobs. Empty list if Redis does not answer. |
| `task:waiting` | `TaskView` | Right after `POST /api/tasks` adds a job. |
| `task:active` | `TaskView` | The worker starts an attempt (progress reset to 0). |
| `task:progress` | `TaskView` | After each step (20, 40 … 100). |
| `task:retrying` | `TaskView` (status `waiting`, `retrying: true`) | An attempt failed and attempts are left. |
| `task:completed` | `TaskView` | The job finished; includes `durationMs` and `finishedAt`. |
| `task:failed` | `TaskView` | The last attempt failed. |

```ts
interface TaskView {
  id: string;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  progress: number;      // 0 to 100
  attempt: number;       // current attempt, or the next one while waiting for a retry
  maxAttempts: number;
  retrying: boolean;     // waiting again after a failed attempt
  durationMs?: number;   // last attempt, finished jobs only
  finishedAt?: number;
}

interface QueueInfo {
  workers: number;       // workers listening to the queue, as Redis reports them
  concurrency: number;   // slots per worker
}
```

There are no client → server events: tasks are sent over HTTP.

The types live in `backend/src/tasks.ts` and are copied by hand into `frontend/src/lib/socket.ts`. **Change both together.**

### Details worth knowing

- `withTimeout()`: with `maxRetriesPerRequest: null` (required by BullMQ), ioredis queues commands forever while Redis is down. The route and the snapshot race them against a 3 s timeout so they fail instead of hanging.
- The attempt number uses `job.attemptsStarted` while active and `job.attemptsMade` otherwise, because `attemptsMade` only counts attempts that have already ended.
- `queue.getWorkersCount()` asks Redis which clients are registered as workers of the queue, so the number is real: if the worker process dies, the title bar shows `0 workers` within 5 s.
- The worker runs in the same process as Express. Scaling would mean running more workers (more processes or more `concurrency`); the board would show them without changes.

## Frontend

### Socket

`getSocket()` in `frontend/src/lib/socket.ts` creates the connection the first time it is called and reuses it afterwards. It connects to the page's own origin: Vite (dev, `frontend/vite.config.ts`) and Caddy (production) forward `/socket.io` to the backend, WebSocket included.

### `useTaskQueue`

Returns `{ tasks, mine, connected, info, sending, error, lastSend, send }`.

- **Board state**: a `Map<id, TaskView>`. `tasks:snapshot` replaces it; every `task:*` event is an upsert, except `task:waiting`, which only adds cards that are not on the board yet. Socket.IO keeps the order of events, but `task:waiting` is sent by the route and the others by the worker, so this guard stops a late `waiting` from moving a running card back.
- **Pruning**: pending tasks are always kept; only the 12 most recent finished ones stay in memory.
- **`send(count)`**: `fetch('/api/tasks')`, measures the response time with `performance.now()` and adds the returned ids to `mine`. The `task:waiting` event can arrive before the HTTP response, so a new card may show `visitor` for a moment before switching to `you`.
- **`connected`** follows the socket's `connect` / `disconnect` events; **`info`** is the latest `queue:info`.
- Listeners are registered in an effect and removed with `socket.off` on unmount. The socket itself stays open for the rest of the session.

### Card (`TaskQueueDemo`)

- Title bar: `○ connecting…` → `● live` → `● live · 1 worker × 2 slots` (`statusLabel()`).
- Columns: `waiting` and `active` sorted by id, `completed` and `failed` newest first. At most 4 cards per column, plus `+N more` for pending ones. 2 × 2 grid on mobile, 4 columns from `sm`.
- Below the columns: the server's response time for the last send, or the error returned by the API.
- On desktop the card keeps `md:pb-[130px]` because the "Real time" card (demo 02) overlaps its bottom.
- The "How I built it" button links to `/queues` with `<Link>`.

### `/queues` screen

Static content from `frontend/src/data/queues.ts`, rendered by `screens/Queues`:

- `SequenceDiagram`: one lifeline per actor (`actors`) and one arrow per message (`flow`), positioned with percentages, so it scales to any width. Styles by `kind`: `http` solid fg, `redis` solid muted, `socket` dashed accent.
- `TaskLifecycle`: the transitions between states (`transitions`).
- `StepCard`: one card per tutorial step (`steps`); text between backticks renders as inline code.

The code excerpts in `data/queues.ts` are trimmed copies of the real files. **When the backend or the hook changes, update them**, or the tutorial will describe code that no longer exists.

## Running it locally

1. Docker Desktop open, then `npm run redis` in `backend/` (see "Backend local setup" in `CLAUDE.md`).
2. `npm run dev` in `backend/` and in `frontend/`.
3. Open `http://localhost:5173/#demos`. Open a second tab to see the shared board (`visitor` cards).

Checking it without a browser:

```bash
curl http://127.0.0.1:3000/api/health
# invalid count → 400, does not enqueue anything
curl -X POST -H "Content-Type: application/json" -d '{"count":99}' http://127.0.0.1:3000/api/tasks
```

## Production

Nothing extra to configure: the backend uses the Redis already running on the VPS (`REDIS_URL`, default `redis://127.0.0.1:6379`), and Caddy already proxies `/api` and `/socket.io` (`docs/server.md`). A push to `main` touching `backend/` or `frontend/` redeploys each part.

Quick check after a deploy (does not enqueue anything):

```bash
curl https://casq89.com/api/health
curl "https://casq89.com/socket.io/?EIO=4&transport=polling"   # Socket.IO handshake
```

Then send a task from the page: if the card reaches `completed`, Redis and the worker are fine.

## Troubleshooting

| Symptom | Cause |
|---|---|
| Title bar stuck on `○ connecting…` | The socket cannot reach the backend: backend down, or `/socket.io` not proxied (Vite or Caddy). |
| `! The queue is offline right now` | Redis is not answering. Locally: `docker ps` and `npm run redis`. In production: Redis on the VPS. |
| Title bar shows `0 workers` | The worker is not connected to Redis (Redis down, or the backend process crashed). |
| Cards stay in `waiting` | Same as above: nobody is consuming the queue. |
| `! Too many tasks, try again in a minute` | Per-IP limit (30 per minute). Restarting the backend resets it. |
| `! The queue is full right now…` | 60 tasks pending; wait a few seconds. |

## Changing the demo

- **More slots or a different speed**: `CONCURRENCY`, `STEPS`, `STEP_MS` in `tasks.ts`. The title bar updates on its own; also review the texts in `data/queues.ts` that mention "2 slots", "5 steps" or "400 ms".
- **More or fewer failures**: `FAILURE_RATE` and `MAX_ATTEMPTS`. With 0.2 and 3 attempts, about 0.8% of tasks end in `failed`.
- **A new event**: add it to `TaskEvents` (backend), to `ServerToClientEvents` (`lib/socket.ts`) and handle it in `useTaskQueue` (including the `socket.off` in the cleanup).
- **Starting from #1 again**: wipe the queue (`queue.obliterate()` or delete the `bull:tasks:*` keys). Not needed for normal use.
