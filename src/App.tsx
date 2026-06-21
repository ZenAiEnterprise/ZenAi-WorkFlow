import { useState } from 'react'
import { Sidebar, Page } from './components/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { Pipeline } from './pages/Pipeline'
import { Contacts } from './pages/Contacts'
import { Settings } from './pages/Settings'
import { AIAssistant } from './pages/AIAssistant'
import { Lead, INITIAL_LEADS } from './data/mockData'

const PAGE_TITLES: Record<Page, string> = {
  dashboard: 'Dashboard',
  pipeline: 'Pipeline',
  contacts: 'Contactos',
  assistant: 'Asistente IA',
  settings: 'Ajustes',
}

function App() {
  const [page, setPage] = useState<Page>('pipeline')
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS)

  return (
    <div className="crm-layout">
      <Sidebar current={page} onNavigate={setPage} />

      <div className="crm-main">
        <header className="topbar">
          <span className="topbar-title">{PAGE_TITLES[page]}</span>
          <div className="topbar-right">
            <span className="topbar-badge">
              <span className="topbar-badge-dot" />
              ZenAI Coaching CRM
            </span>
            <span className="topbar-date">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
        </header>

        <main className="crm-content">
          {page === 'dashboard' && <Dashboard leads={leads} />}
          {page === 'pipeline' && <Pipeline leads={leads} onUpdate={setLeads} />}
          {page === 'contacts' && <Contacts leads={leads} onUpdate={setLeads} />}
          {page === 'assistant' && <AIAssistant />}
          {page === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  )
}

export default App
