import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Redis } from 'ioredis';
import { contactRouter } from './contact.js';
import { createIssDemo, type IssClientEvents, type IssEvents } from './iss.js';
import { createMetricsDemo, type MetricsClientEvents, type MetricsEvents } from './metrics.js';
import { createTasksDemo, type TaskEvents } from './tasks.js';

type ServerToClientEvents = TaskEvents & MetricsEvents & IssEvents;
type ClientToServerEvents = MetricsClientEvents & IssClientEvents;

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? '127.0.0.1';
const REDIS_URL = process.env.REDIS_URL ?? 'redis://127.0.0.1:6379';

const app = express();
// Caddy runs on the same host: trust it so req.ip is the visitor's IP.
app.set('trust proxy', 'loopback');
app.use(express.json());
app.use('/api/contact', contactRouter);

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer);

const connection = new Redis(REDIS_URL, { maxRetriesPerRequest: null });
connection.on('error', (err) => {
  console.error('Redis error:', err.message);
});

app.use('/api/tasks', createTasksDemo(io, connection));
createMetricsDemo(io);
createIssDemo(io);

app.get('/api/health', (_req, res) => {
  res.json({ ok: 'from typescript' });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
});

httpServer.listen(PORT, HOST, () => {
  console.log(`Backend listening on ${HOST}:${PORT}`);
});
