import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import './ClaudeTerminal.css'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface TerminalLine {
  id: number
  type: 'system' | 'user' | 'assistant' | 'error'
  content: string
  streaming?: boolean
}

let _id = 0
const uid = () => ++_id

const WELCOME: TerminalLine[] = [
  { id: uid(), type: 'system', content: '╭──────────────────────────────────────╮' },
  { id: uid(), type: 'system', content: '│    ZenAi WorkFlow Terminal  v1.0.0   │' },
  { id: uid(), type: 'system', content: '│    Powered by Claude Opus 4.6        │' },
  { id: uid(), type: 'system', content: '╰──────────────────────────────────────╯' },
  { id: uid(), type: 'system', content: '' },
  { id: uid(), type: 'system', content: 'Ask anything. Commands: /help  /clear  /reset' },
  { id: uid(), type: 'system', content: '' },
]

const HELP_LINES: TerminalLine[] = [
  { id: uid(), type: 'system', content: '' },
  { id: uid(), type: 'system', content: 'Commands:' },
  { id: uid(), type: 'system', content: '  /clear   Clear terminal output' },
  { id: uid(), type: 'system', content: '  /reset   Clear terminal and reset conversation' },
  { id: uid(), type: 'system', content: '  /help    Show this help' },
  { id: uid(), type: 'system', content: '' },
  { id: uid(), type: 'system', content: '↑ / ↓     Navigate command history' },
  { id: uid(), type: 'system', content: '' },
]

export function ClaudeTerminal() {
  const [lines, setLines] = useState<TerminalLine[]>(WELCOME)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)

  const outputRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = outputRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  const addLines = (...newLines: Omit<TerminalLine, 'id'>[]) =>
    setLines((prev) => [...prev, ...newLines.map((l) => ({ ...l, id: uid() }))])

  const handleCommand = (cmd: string): boolean => {
    switch (cmd) {
      case '/clear':
        setLines([])
        return true
      case '/reset':
        setMessages([])
        setLines([
          { id: uid(), type: 'system', content: 'Conversation reset.' },
          { id: uid(), type: 'system', content: '' },
        ])
        return true
      case '/help':
        setLines((prev) => [
          ...prev,
          ...HELP_LINES.map((l) => ({ ...l, id: uid() })),
        ])
        return true
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    setCmdHistory((prev) => [text, ...prev])
    setHistIdx(-1)
    addLines({ type: 'user', content: text })

    if (text.startsWith('/')) {
      if (!handleCommand(text)) {
        addLines(
          { type: 'error', content: `Unknown command: ${text}` },
          { type: 'system', content: '' },
        )
      }
      return
    }

    const nextMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(nextMessages)
    setLoading(true)

    const streamId = uid()
    setLines((prev) => [
      ...prev,
      { id: streamId, type: 'assistant', content: '', streaming: true },
    ])

    let fullText = ''

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      })

      if (!res.ok) throw new Error(`Server responded with ${res.status}`)

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()

      outer: while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const raw = decoder.decode(value, { stream: true })
        for (const line of raw.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (payload === '[DONE]') break outer

          try {
            const parsed = JSON.parse(payload) as {
              type: string
              text?: string
              message?: string
            }

            if (parsed.type === 'text' && parsed.text) {
              fullText += parsed.text
              setLines((prev) =>
                prev.map((l) =>
                  l.id === streamId ? { ...l, content: fullText } : l,
                ),
              )
            } else if (parsed.type === 'error') {
              throw new Error(parsed.message ?? 'Claude error')
            }
          } catch {
            /* skip malformed SSE data */
          }
        }
      }

      setLines((prev) =>
        prev.map((l) => (l.id === streamId ? { ...l, streaming: false } : l)),
      )
      setMessages((prev) => [...prev, { role: 'assistant', content: fullText }])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connection failed'
      setLines((prev) =>
        prev.map((l) =>
          l.id === streamId
            ? { ...l, type: 'error', content: `Error: ${msg}`, streaming: false }
            : l,
        ),
      )
    } finally {
      setLoading(false)
      addLines({ type: 'system', content: '' })
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(histIdx + 1, cmdHistory.length - 1)
      setHistIdx(next)
      setInput(cmdHistory[next] ?? '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (histIdx <= 0) {
        setHistIdx(-1)
        setInput('')
      } else {
        const next = histIdx - 1
        setHistIdx(next)
        setInput(cmdHistory[next])
      }
    }
  }

  return (
    <div className="terminal" onClick={() => inputRef.current?.focus()}>
      {/* Title bar */}
      <div className="terminal-titlebar">
        <div className="terminal-dots">
          <span className="dot dot-red" />
          <span className="dot dot-yellow" />
          <span className="dot dot-green" />
        </div>
        <span className="terminal-title">zenai — claude-opus-4-6</span>
        <span className="terminal-title-right" />
      </div>

      {/* Output */}
      <div className="terminal-output" ref={outputRef}>
        {lines.map((line) => (
          <div key={line.id} className={`tline tline-${line.type}`}>
            {line.type === 'user' && (
              <span className="tprompt">zenai&nbsp;$&nbsp;</span>
            )}
            <span className="ttext">{line.content}</span>
            {line.streaming && !line.content && (
              <span className="tcursor">▋</span>
            )}
          </div>
        ))}
        {loading && lines.at(-1)?.streaming && lines.at(-1)?.content && (
          <span className="tcursor-inline">▋</span>
        )}
      </div>

      {/* Input bar */}
      <div className="terminal-inputbar">
        <span className="tprompt">zenai&nbsp;$&nbsp;</span>
        <input
          ref={inputRef}
          className="terminal-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          placeholder={loading ? 'Claude is responding…' : ''}
        />
      </div>
    </div>
  )
}
