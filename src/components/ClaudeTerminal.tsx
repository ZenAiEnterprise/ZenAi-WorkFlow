import { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import './ClaudeTerminal.css'

export function ClaudeTerminal() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const term = new Terminal({
      theme: {
        background: '#1e1e2e',
        foreground: '#cdd6f4',
        cursor: '#cba6f7',
        cursorAccent: '#1e1e2e',
        selectionBackground: '#45475a',
        black: '#45475a',
        red: '#f38ba8',
        green: '#a6e3a1',
        yellow: '#f9e2af',
        blue: '#89b4fa',
        magenta: '#cba6f7',
        cyan: '#94e2d5',
        white: '#bac2de',
        brightBlack: '#585b70',
        brightRed: '#f38ba8',
        brightGreen: '#a6e3a1',
        brightYellow: '#f9e2af',
        brightBlue: '#89b4fa',
        brightMagenta: '#cba6f7',
        brightCyan: '#94e2d5',
        brightWhite: '#a6adc8',
      },
      fontFamily:
        "'Menlo', 'Monaco', 'Cascadia Code', 'Fira Code', 'Consolas', monospace",
      fontSize: 14,
      lineHeight: 1.5,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 5000,
      allowTransparency: false,
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)

    const el = containerRef.current!
    term.open(el)
    fitAddon.fit()

    const ws = new WebSocket(`ws://${location.host}/ws`)

    ws.onopen = () => {
      ws.send(
        JSON.stringify({ type: 'resize', data: { cols: term.cols, rows: term.rows } }),
      )
    }

    ws.onmessage = (e: MessageEvent<string>) => {
      term.write(e.data)
    }

    ws.onerror = () => {
      term.write('\r\n\x1b[31mCould not connect to server.\x1b[0m\r\n')
    }

    ws.onclose = () => {
      term.write('\r\n\x1b[33mSession closed.\x1b[0m\r\n')
    }

    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'input', data }))
      }
    })

    const ro = new ResizeObserver(() => {
      fitAddon.fit()
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({ type: 'resize', data: { cols: term.cols, rows: term.rows } }),
        )
      }
    })
    ro.observe(el)

    return () => {
      term.dispose()
      ws.close()
      ro.disconnect()
    }
  }, [])

  return (
    <div className="terminal-shell">
      <div className="terminal-titlebar">
        <div className="terminal-dots">
          <span className="dot dot-red" />
          <span className="dot dot-yellow" />
          <span className="dot dot-green" />
        </div>
        <span className="terminal-title">zenai — claude</span>
        <span style={{ width: 54 }} />
      </div>
      <div ref={containerRef} className="terminal-container" />
    </div>
  )
}
