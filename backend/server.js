import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'

const PORT = Number(process.env.PORT ?? 3000)
const HOST = process.env.HOST ?? '127.0.0.1'
const REDIS_URL = process.env.REDIS_URL ?? 'redis://127.0.0.1:6379'

const app = express()
app.use(express.json())

const httpServer = createServer(app)
const io = new Server(httpServer)

const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null })
const cola = new Queue('tareas', { connection })

const worker = new Worker(
  'tareas',
  async (job) => {
    await new Promise((r) => setTimeout(r, 2000))
    return `Procesado: ${job.data.mensaje}`
  },
  { connection }
)

worker.on('completed', (job, resultado) => {
  io.emit('tarea:completada', { id: job.id, resultado })
})

app.get('/api/salud', (req, res) => res.json({ ok: true }))

app.post('/api/tareas', async (req, res) => {
  const mensaje = String(req.body?.mensaje ?? 'hola').slice(0, 200)
  const job = await cola.add('demo', { mensaje })
  res.json({ id: job.id })
})

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id)
})

httpServer.listen(PORT, HOST, () => {
  console.log(`Backend escuchando en ${HOST}:${PORT}`)
})