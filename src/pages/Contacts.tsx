import { useState, useMemo } from 'react'
import { Lead, STAGES, COACHES, PROGRAMS, formatCurrency, formatDate, getInitials } from '../data/mockData'
import './Contacts.css'

interface Props {
  leads: Lead[]
  onUpdate: (leads: Lead[]) => void
}

type SortKey = 'name' | 'value' | 'createdAt' | 'coach' | 'stage'

const PRIORITY_LABEL: Record<string, string> = { high: 'Alta', medium: 'Media', low: 'Baja' }
const PRIORITY_COLOR: Record<string, string> = { high: '#ef4444', medium: '#f59e0b', low: '#6366f1' }

export function Contacts({ leads, onUpdate }: Props) {
  const [search, setSearch] = useState('')
  const [filterStage, setFilterStage] = useState('')
  const [filterCoach, setFilterCoach] = useState('')
  const [filterProgram, setFilterProgram] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortAsc, setSortAsc] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    const arr = leads.filter(l => {
      const matchSearch = !q || l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.coach.toLowerCase().includes(q)
      const matchStage = !filterStage || l.stage === filterStage
      const matchCoach = !filterCoach || l.coach === filterCoach
      const matchProg = !filterProgram || l.program === filterProgram
      return matchSearch && matchStage && matchCoach && matchProg
    })

    arr.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name)
      else if (sortKey === 'value') cmp = a.value - b.value
      else if (sortKey === 'createdAt') cmp = a.createdAt.localeCompare(b.createdAt)
      else if (sortKey === 'coach') cmp = a.coach.localeCompare(b.coach)
      else if (sortKey === 'stage') cmp = a.stage.localeCompare(b.stage)
      return sortAsc ? cmp : -cmp
    })

    return arr
  }, [leads, search, filterStage, filterCoach, filterProgram, sortKey, sortAsc])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(v => !v)
    else { setSortKey(key); setSortAsc(true) }
  }

  const selectedLead = selected ? leads.find(l => l.id === selected) : null

  const deleteLead = (id: string) => {
    onUpdate(leads.filter(l => l.id !== id))
    setSelected(null)
  }

  return (
    <div className="contacts-page">
      <div className="contacts-controls">
        <div className="pipe-search-wrap">
          <SearchIcon />
          <input className="pipe-search" placeholder="Buscar por nombre, email o coach..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="pipe-select" value={filterStage} onChange={e => setFilterStage(e.target.value)}>
          <option value="">Todas las etapas</option>
          {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <select className="pipe-select" value={filterCoach} onChange={e => setFilterCoach(e.target.value)}>
          <option value="">Todos los coaches</option>
          {COACHES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="pipe-select" value={filterProgram} onChange={e => setFilterProgram(e.target.value)}>
          <option value="">Todos los programas</option>
          {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <span className="contacts-count">{filtered.length} contactos</span>
      </div>

      <div className="contacts-layout">
        <div className="contacts-table-wrap">
          <table className="contacts-table">
            <thead>
              <tr>
                <th className="th-sortable" onClick={() => toggleSort('name')}>Contacto {sortKey === 'name' && (sortAsc ? '↑' : '↓')}</th>
                <th className="th-sortable" onClick={() => toggleSort('coach')}>Coach {sortKey === 'coach' && (sortAsc ? '↑' : '↓')}</th>
                <th>Programa</th>
                <th className="th-sortable" onClick={() => toggleSort('stage')}>Etapa {sortKey === 'stage' && (sortAsc ? '↑' : '↓')}</th>
                <th>Prioridad</th>
                <th className="th-sortable th-right" onClick={() => toggleSort('value')}>Valor {sortKey === 'value' && (sortAsc ? '↑' : '↓')}</th>
                <th className="th-sortable th-right" onClick={() => toggleSort('createdAt')}>Registro {sortKey === 'createdAt' && (sortAsc ? '↑' : '↓')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => {
                const stage = STAGES.find(s => s.key === lead.stage)!
                return (
                  <tr key={lead.id} className={`contact-row ${selected === lead.id ? 'contact-row--selected' : ''}`} onClick={() => setSelected(lead.id === selected ? null : lead.id)}>
                    <td>
                      <div className="contact-name-cell">
                        <div className="contact-avatar">{getInitials(lead.name)}</div>
                        <div>
                          <div className="contact-full-name">{lead.name}</div>
                          <div className="contact-email">{lead.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="td-muted">{lead.coach}</td>
                    <td><span className="contact-program-chip">{lead.program}</span></td>
                    <td>
                      <span className="contact-stage-badge" style={{ '--sc': stage.color } as React.CSSProperties}>
                        <span className="stage-dot" style={{ background: stage.color }} />{stage.label}
                      </span>
                    </td>
                    <td><span className="contact-priority" style={{ color: PRIORITY_COLOR[lead.priority], background: PRIORITY_COLOR[lead.priority] + '18' }}>{PRIORITY_LABEL[lead.priority]}</span></td>
                    <td className="td-right td-value">{formatCurrency(lead.value)}<span className="td-mo">/mo</span></td>
                    <td className="td-right td-muted">{formatDate(lead.createdAt)}</td>
                  </tr>
                )
              })}
              {filtered.length === 0 && <tr><td colSpan={7} className="contacts-empty">No se encontraron contactos</td></tr>}
            </tbody>
          </table>
        </div>

        {selectedLead && <ContactDetail lead={selectedLead} onClose={() => setSelected(null)} onDelete={() => deleteLead(selectedLead.id)} />}
      </div>
    </div>
  )
}

interface DetailProps {
  lead: Lead
  onClose: () => void
  onDelete: () => void
}

function ContactDetail({ lead, onClose, onDelete }: DetailProps) {
  const stage = STAGES.find(s => s.key === lead.stage)!

  return (
    <div className="contact-detail">
      <div className="detail-header">
        <h3>Detalle</h3>
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>

      <div className="detail-body">
        <div className="detail-avatar-row">
          <div className="detail-avatar">{getInitials(lead.name)}</div>
          <div>
            <div className="detail-name">{lead.name}</div>
            <div className="detail-email">{lead.email}</div>
          </div>
        </div>

        <div className="detail-section">
          <DetailRow label="Teléfono" value={lead.phone || '—'} />
          <DetailRow label="Coach" value={lead.coach} />
          <DetailRow label="Programa" value={lead.program} />
          <DetailRow label="Valor" value={`${formatCurrency(lead.value)}/mes`} />
          <DetailRow label="Registro" value={formatDate(lead.createdAt)} />
          <DetailRow label="Prioridad" value={PRIORITY_LABEL[lead.priority]} />
          <div className="detail-row">
            <span className="detail-label">Etapa</span>
            <span className="contact-stage-badge" style={{ '--sc': stage.color } as React.CSSProperties}>
              <span className="stage-dot" style={{ background: stage.color }} />{stage.label}
            </span>
          </div>
        </div>

        {lead.tags.length > 0 && (
          <div className="detail-section">
            <div className="detail-section-title">Etiquetas</div>
            <div style={{ flexWrap: 'wrap', display: 'flex', gap: 4, padding: '10px 12px' }}>
              {lead.tags.map(t => <span key={t} className="lead-tag" style={{ color: '#94a3b8', borderColor: '#94a3b844' }}>{t}</span>)}
            </div>
          </div>
        )}

        {lead.notes && (
          <div className="detail-section">
            <div className="detail-section-title">Notas</div>
            <p className="detail-notes">{lead.notes}</p>
          </div>
        )}

        <button className="detail-delete-btn" onClick={onDelete}>Eliminar contacto</button>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <div className="detail-row"><span className="detail-label">{label}</span><span className="detail-value">{value}</span></div>
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', pointerEvents: 'none' }}>
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
