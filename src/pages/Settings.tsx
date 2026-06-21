import { useState } from 'react'
import './Settings.css'

interface ApiKey {
  id: string
  name: string
  prefix: string
  secret: string
  createdAt: string
  lastUsed: string
  scope: 'live' | 'test'
}

interface AppIntegration {
  id: string
  name: string
  description: string
  category: string
  connected: boolean
  icon: string
  color: string
}

const INITIAL_KEYS: ApiKey[] = [
  { id: '1', name: 'ZenAI Producción', prefix: 'zai_live_', secret: 'sk_8f72a91c3e4b56d0917f2a3c4e5d6f70', createdAt: '2025-01-15', lastUsed: 'Hace 2 horas', scope: 'live' },
  { id: '2', name: 'ZenAI Sandbox',    prefix: 'zai_test_', secret: 'sk_1a2b3c4d5e6f70819203a4b5c6d7e8f9', createdAt: '2025-02-03', lastUsed: 'Hace 3 días',  scope: 'test' },
]

const INITIAL_APPS: AppIntegration[] = [
  { id: 'gmail',     name: 'Gmail',             description: 'Sincroniza correos y envía secuencias automáticas',  category: 'Email',       connected: true,  icon: '✉️', color: '#ef4444' },
  { id: 'calendar',  name: 'Google Calendar',   description: 'Agenda discovery calls y sesiones de coaching',      category: 'Calendario',  connected: true,  icon: '📅', color: '#0ea5e9' },
  { id: 'whatsapp',  name: 'WhatsApp Business', description: 'Mensajería directa con leads y clientes',            category: 'Mensajería',  connected: true,  icon: '💬', color: '#10b981' },
  { id: 'slack',     name: 'Slack',             description: 'Notificaciones de pipeline para tu equipo',          category: 'Equipo',      connected: false, icon: '🔔', color: '#8b5cf6' },
  { id: 'zoom',      name: 'Zoom',              description: 'Genera links de videollamada automáticamente',       category: 'Videollamadas',connected: true,  icon: '🎥', color: '#38bdf8' },
  { id: 'stripe',    name: 'Stripe',            description: 'Cobros y facturación de programas de coaching',      category: 'Pagos',       connected: false, icon: '💳', color: '#6366f1' },
  { id: 'calendly',  name: 'Calendly',          description: 'Reserva automática de citas de discovery',           category: 'Calendario',  connected: false, icon: '🗓️', color: '#f59e0b' },
  { id: 'mailchimp', name: 'Mailchimp',         description: 'Campañas de email marketing para nutrir leads',      category: 'Email',       connected: false, icon: '📧', color: '#fbbf24' },
]

type Tab = 'keys' | 'apps'

export function Settings() {
  const [tab, setTab] = useState<Tab>('keys')
  const [keys, setKeys] = useState(INITIAL_KEYS)
  const [apps, setApps] = useState(INITIAL_APPS)
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const toggleReveal = (id: string) => {
    setRevealed(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const copyKey = async (key: ApiKey) => {
    try {
      await navigator.clipboard.writeText(key.prefix + key.secret)
      setCopiedId(key.id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  const regenerateKey = (id: string) => {
    setKeys(prev => prev.map(k => k.id === id
      ? { ...k, secret: Array.from({ length: 32 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join(''), createdAt: new Date().toISOString().slice(0, 10), lastUsed: 'Nunca' }
      : k))
  }

  const toggleApp = (id: string) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, connected: !a.connected } : a))
  }

  const connectedCount = apps.filter(a => a.connected).length

  return (
    <div className="settings-page">
      <div className="settings-tabs">
        <button className={`settings-tab ${tab === 'keys' ? 'settings-tab--active' : ''}`} onClick={() => setTab('keys')}>
          API Keys
        </button>
        <button className={`settings-tab ${tab === 'apps' ? 'settings-tab--active' : ''}`} onClick={() => setTab('apps')}>
          Apps Conectadas <span className="settings-tab-count">{connectedCount}</span>
        </button>
      </div>

      {tab === 'keys' && (
        <div className="settings-section">
          <div className="settings-section-header">
            <div>
              <h3>Claves de API</h3>
              <p>Usa estas claves para conectar ZenAI CRM con tus propias integraciones o automatizaciones.</p>
            </div>
          </div>

          <div className="key-list">
            {keys.map(key => {
              const full = key.prefix + key.secret
              const masked = key.prefix + '••••••••••••••••••••••••'
              const isRevealed = revealed.has(key.id)
              return (
                <div key={key.id} className="key-card">
                  <div className="key-card-top">
                    <div className="key-card-title">
                      <span className={`key-scope key-scope--${key.scope}`}>{key.scope === 'live' ? 'PRODUCCIÓN' : 'PRUEBA'}</span>
                      <span className="key-name">{key.name}</span>
                    </div>
                    <div className="key-meta">Creada {key.createdAt} · Último uso: {key.lastUsed}</div>
                  </div>
                  <div className="key-value-row">
                    <code className="key-value">{isRevealed ? full : masked}</code>
                    <button className="key-action-btn" onClick={() => toggleReveal(key.id)}>{isRevealed ? 'Ocultar' : 'Mostrar'}</button>
                    <button className="key-action-btn" onClick={() => copyKey(key)}>{copiedId === key.id ? '¡Copiado!' : 'Copiar'}</button>
                    <button className="key-action-btn key-action-btn--danger" onClick={() => regenerateKey(key.id)}>Regenerar</button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="settings-callout">
            <span className="settings-callout-dot" />
            <div>
              <strong>Asistente IA conectado.</strong> El motor de ZenAI corre sobre el modelo Claude vía CLI, sin exponer claves en el navegador.
            </div>
          </div>
        </div>
      )}

      {tab === 'apps' && (
        <div className="settings-section">
          <div className="settings-section-header">
            <div>
              <h3>Aplicaciones Conectadas</h3>
              <p>Integra ZenAI CRM con las herramientas que ya usas para gestionar tu negocio de coaching.</p>
            </div>
          </div>

          <div className="app-grid">
            {apps.map(app => (
              <div key={app.id} className="app-card">
                <div className="app-card-top">
                  <div className="app-icon" style={{ background: `${app.color}22` }}>{app.icon}</div>
                  <span className={`app-status ${app.connected ? 'app-status--on' : 'app-status--off'}`}>
                    {app.connected ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>
                <div className="app-name">{app.name}</div>
                <div className="app-category">{app.category}</div>
                <p className="app-description">{app.description}</p>
                <button
                  className={`app-toggle-btn ${app.connected ? 'app-toggle-btn--disconnect' : 'app-toggle-btn--connect'}`}
                  onClick={() => toggleApp(app.id)}
                >
                  {app.connected ? 'Desconectar' : 'Conectar'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
