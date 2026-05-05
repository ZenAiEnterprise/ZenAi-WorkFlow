import express from 'express'
import { createServer } from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import * as pty from 'node-pty'

const app = express()
const httpServer = createServer(app)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', terminal: 'claude' })
})

const wss = new WebSocketServer({ server: httpServer, path: '/ws' })

wss.on('connection', (ws: WebSocket) => {
  const ptyProcess = pty.spawn('claude', [], {
    name: 'xterm-256color',
    cols: 80,
    rows: 24,
    cwd: process.env.HOME ?? process.cwd(),
    env: process.env as Record<string, string>,
  })

  ptyProcess.onData((data: string) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(data)
  })

  ptyProcess.onExit(() => {
    if (ws.readyState === WebSocket.OPEN) ws.close()
  })

  ws.on('message', (msg: Buffer) => {
    try {
      const { type, data } = JSON.parse(msg.toString()) as {
        type: string
        data: string | { cols: number; rows: number }
      }
      if (type === 'input') {
        ptyProcess.write(data as string)
      } else if (type === 'resize') {
        const { cols, rows } = data as { cols: number; rows: number }
        ptyProcess.resize(cols, rows)
      }
    } catch {
      /* ignore malformed messages */
    }
  })

  ws.on('close', () => {
    try { ptyProcess.kill() } catch { /* already dead */ }
  })
})

const PORT = parseInt(process.env.PORT ?? '3001', 10)
httpServer.listen(PORT, () => {
  console.log(`\n🚀  ZenAi WorkFlow server   http://localhost:${PORT}`)
  console.log(`🖥️   Claude terminal via pty  (no API key needed)`)
  console.log(`✅  Open http://localhost:5173\n`)
})
