import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌  ANTHROPIC_API_KEY is not set.')
  console.error('    Copy .env.example to .env and add your key.')
  process.exit(1)
}

const app = express()
app.use(cors())
app.use(express.json())

const client = new Anthropic()

const SYSTEM_PROMPT =
  'You are Claude, an AI assistant integrated into the ZenAi WorkFlow terminal. ' +
  'Help users with their workflow: answer questions, write and review code, ' +
  'explain concepts, and assist with any task. ' +
  'Keep responses concise and direct — this is a terminal interface. ' +
  'Use plain text for simple answers and fenced code blocks for code.'

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', model: 'claude-opus-4-6' })
})

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body as {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages must be a non-empty array' })
    return
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const send = (payload: object) =>
    res.write(`data: ${JSON.stringify(payload)}\n\n`)

  try {
    const stream = client.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 64000,
      thinking: { type: 'adaptive' },
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    })

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        send({ type: 'text', text: event.delta.text })
      }
    }

    res.write('data: [DONE]\n\n')
  } catch (err) {
    const message =
      err instanceof Anthropic.APIError
        ? `Claude API error (${err.status}): ${err.message}`
        : err instanceof Error
          ? err.message
          : 'Unknown error'
    send({ type: 'error', message })
  } finally {
    res.end()
  }
})

const PORT = parseInt(process.env.PORT ?? '3001', 10)
app.listen(PORT, () => {
  console.log(`\n🚀  ZenAi WorkFlow API   http://localhost:${PORT}`)
  console.log(`🤖  Model               claude-opus-4-6`)
  console.log(`✅  Ready\n`)
})
