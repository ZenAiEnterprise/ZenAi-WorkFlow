import { ClaudeTerminal } from '../components/ClaudeTerminal'
import './AIAssistant.css'

export function AIAssistant() {
  return (
    <div className="ai-page">
      <div className="ai-page-header">
        <h3>Asistente IA</h3>
        <p>Pídele a ZenAI que resuma el pipeline, redacte un seguimiento o priorice tus leads.</p>
      </div>
      <div className="ai-terminal-wrap">
        <ClaudeTerminal />
      </div>
    </div>
  )
}
