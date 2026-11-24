import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { contactRouter } from './contact.js';

interface TaskData {
  message: string;
}

interface ServerToClientEvents {
  'task:completed': (data: { id: string; result: string }) => void;
}

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? '127.0.0.1';
const REDIS_URL = process.env.REDIS_URL ?? 'redis://127.0.0.1:6379';

const app = express();
// Caddy runs on the same host: trust it so req.ip is the visitor's IP.
app.set('trust proxy', 'loopback');
app.use(express.json());
app.use('/api/contact', contactRouter);

const httpServer = createServer(app);
const io = new Server<{}, ServerToClientEvents>(httpServer);

const connection = new Redis(REDIS_URL, { maxRetriesPerRequest: null });
const queue = new Queue<TaskData>('tasks', { connection });

const worker = new Worker<TaskData, string>(
  'tasks',
  async (job) => {
    await new Promise((r) => setTimeout(r, 2000));
    return `Processed: ${job.data.message}`;
  },
  { connection },
);

worker.on('completed', (job, result) => {
  io.emit('task:completed', { id: job.id ?? '', result });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: 'from typescript' });
});

app.post('/api/tasks', async (req, res) => {
  const message = String(req.body?.message ?? 'hello').slice(0, 200);
  const job = await queue.add('demo', { message });
  res.json({ id: job.id });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
});

httpServer.listen(PORT, HOST, () => {
  console.log(`Backend listening on ${HOST}:${PORT}`);
});
