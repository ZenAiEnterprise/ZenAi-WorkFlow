import { useState, useRef } from 'react'
import {
  Lead, Stage, STAGES, COACHES, PROGRAMS,
  formatCurrency, formatDate, getInitials,
} from '../data/mockData'
import './Pipeline.css'

interface Props {
  leads: Lead[]
  onUpdate: (leads: Lead[]) => void
}

const PRIORITY_COLOR: Record<string, string> = { high: '#ef4444', medium: '#f59e0b', low: '#6366f1' }
const TAG_COLORS: Record<string, string> = {
  corporativo: '#0ea5e9', startup: '#8b5cf6', personal: '#10b981',
  urgente: '#ef4444', vip: '#f59e0b', online: '#6366f1',
}

export function Pipeline({ leads, onUpdate }: Props) {
  const [dragId, setDragId] = useState<string | null>(null)
  const [overStage, setOverStage] = useState<Stage | null>(null)
  const [search, setSearch] = useState('')
  const [filterCoach, setFilterCoach] = useState('')
  const [filterProgram, setFilterProgram] = useState('')
  const [modal, setModal] = useState<Lead | null>(null)
  const [addModal, setAddModal] = useState(false)
  const dragNode = useRef<HTMLDivElement | null>(null)

  const filtered = leads.filter(l => {
    const q = search.toLowerCase()
    const matchSearch = !q || l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q)
    const matchCoach = !filterCoach || l.coach === filterCoach
    const matchProgram = !filterProgram || l.program === filterProgram
    return matchSearch && matchCoach && matchProgram
  })

  const byStage = (stage: Stage) => filtered.filter(l => l.stage === stage)

  const moveCard = (id: string, toStage: Stage) => {
    onUpdate(leads.map(l => l.id === id ? { ...l, stage: toStage } : l))
  }

  const deleteCard = (id: string) => {
    onUpdate(leads.filter(l => l.id !== id))
    setModal(null)
  }

  const addLead = (lead: Lead) => {
    onUpdate([lead, ...leads])
    setAddModal(false)
  }

  const updateLead = (updated: Lead) => {
    onUpdate(leads.map(l => l.id === updated.id ? updated : l))
    setModal(updated)
  }

  const onDragStart = (e: React.DragEvent, id: string, el: HTMLDivElement) => {
    setDragId(id)
    dragNode.current = el
    e.dataTransfer.effectAllowed = 'move'
    setTimeout(() => el.classList.add('dragging'), 0)
  }

  const onDragEnd = () => {
    dragNode.current?.classList.remove('dragging')
    setDragId(null)
    setOverStage(null)
    dragNode.current = null
  }

  const onDragOver = (e: React.DragEvent, stage: Stage) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setOverStage(stage)
  }

  const onDrop = (e: React.DragEvent, stage: Stage) => {
    e.preventDefault()
    if (dragId) moveCard(dragId, stage)
    setOverStage(null)
  }

  return (
    <div className="pipeline-page">
      <div className="pipeline-controls">
        <div className="pipe-search-wrap">
          <SearchIcon />
          <input className="pipe-search" placeholder="Buscar contacto..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="pipe-select" value={filterCoach} onChange={e => setFilterCoach(e.target.value)}>
          <option value="">Todos los coaches</option>
          {COACHES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="pipe-select" value={filterProgram} onChange={e => setFilterProgram(e.target.value)}>
          <option value="">Todos los programas</option>
          {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button className="pipe-btn-add" onClick={() => setAddModal(true)}><span>+</span> Nuevo Lead</button>
      </div>

      <div className="kanban-board">
        {STAGES.map(stage => {
          const cards = byStage(stage.key)
          const total = cards.reduce((s, l) => s + l.value, 0)
          return (
            <div
              key={stage.key}
              className={`kanban-col ${overStage === stage.key && dragId ? 'kanban-col--over' : ''}`}
              onDragOver={e => onDragOver(e, stage.key)}
              onDrop={e => onDrop(e, stage.key)}
              onDragLeave={() => setOverStage(null)}
            >
              <div className="kanban-col-header">
                <div className="kanban-col-title">
                  <span className="kanban-stage-dot" style={{ background: stage.color }} />
                  <span className="kanban-stage-name">{stage.label}</span>
                  <span className="kanban-count">{cards.length}</span>
                </div>
                <div className="kanban-col-sub">{formatCurrency(total)}</div>
              </div>

              <div className="kanban-cards">
                {cards.map(lead => (
                  <LeadCard key={lead.id} lead={lead} stageColor={stage.color} onDragStart={onDragStart} onDragEnd={onDragEnd} onClick={() => setModal(lead)} />
                ))}
                {cards.length === 0 && <div className="kanban-empty"><span>Sin contactos</span></div>}
              </div>
            </div>
          )
        })}
      </div>

      {modal && (
        <LeadModal lead={modal} onClose={() => setModal(null)} onMove={stage => { moveCard(modal.id, stage); setModal({ ...modal, stage }) }} onDelete={() => deleteCard(modal.id)} onUpdate={updateLead} />
      )}

      {addModal && <AddLeadModal onClose={() => setAddModal(false)} onAdd={addLead} />}
    </div>
  )
}

interface CardProps {
  lead: Lead
  stageColor: string
  onDragStart: (e: React.DragEvent, id: string, el: HTMLDivElement) => void
  onDragEnd: () => void
  onClick: () => void
}

function LeadCard({ lead, stageColor, onDragStart, onDragEnd, onClick }: CardProps) {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={ref}
      className="lead-card"
      draggable
      onDragStart={e => ref.current && onDragStart(e, lead.id, ref.current)}
      onDragEnd={onDragEnd}
      onClick={onClick}
      style={{ '--stage-color': stageColor } as React.CSSProperties}
    >
      <div className="lead-card-top">
        <div className="lead-avatar">{getInitials(lead.name)}</div>
        <div className="lead-info">
          <span className="lead-name">{lead.name}</span>
          <span className="lead-email">{lead.email}</span>
        </div>
        <span className="lead-priority" style={{ background: PRIORITY_COLOR[lead.priority] + '22', color: PRIORITY_COLOR[lead.priority] }} title={`Prioridad ${lead.priority}`}>●</span>
      </div>

      <div className="lead-meta">
        <span className="lead-coach">{lead.coach}</span>
        <span className="lead-program-chip">{lead.program}</span>
      </div>

      {lead.tags.length > 0 && (
        <div className="lead-tags">
          {lead.tags.map(t => (
            <span key={t} className="lead-tag" style={{ color: TAG_COLORS[t] ?? '#94a3b8', borderColor: (TAG_COLORS[t] ?? '#94a3b8') + '44' }}>{t}</span>
          ))}
        </div>
      )}

      <div className="lead-footer">
        <span className="lead-value">{formatCurrency(lead.value)}<span className="lead-value-mo">/mo</span></span>
        <span className="lead-date">{formatDate(lead.createdAt)}</span>
      </div>
    </div>
  )
}

interface ModalProps {
  lead: Lead
  onClose: () => void
  onMove: (stage: Stage) => void
  onDelete: () => void
  onUpdate: (lead: Lead) => void
}

function LeadModal({ lead, onClose, onMove, onDelete, onUpdate }: ModalProps) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(lead)

  const save = () => { onUpdate(form); setEditing(false) }
  const currentIdx = STAGES.findIndex(s => s.key === lead.stage)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-avatar">{getInitials(lead.name)}</div>
          <div className="modal-title-block">
            <h2 className="modal-name">{lead.name}</h2>
            <span className="modal-program">{lead.program}</span>
          </div>
          <div className="modal-actions-top">
            <button className="modal-btn modal-btn--ghost" onClick={() => setEditing(!editing)}>{editing ? 'Cancelar' : 'Editar'}</button>
            <button className="modal-btn modal-btn--danger" onClick={onDelete}>Eliminar</button>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
        </div>

        {editing ? (
          <div className="modal-form">
            <div className="form-row"><label>Nombre</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-row"><label>Email</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div className="form-row"><label>Teléfono</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="form-row"><label>Coach</label><select value={form.coach} onChange={e => setForm({ ...form, coach: e.target.value })}>{COACHES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div className="form-row"><label>Programa</label><select value={form.program} onChange={e => setForm({ ...form, program: e.target.value })}>{PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
            <div className="form-row"><label>Valor (€/mes)</label><input type="number" value={form.value} onChange={e => setForm({ ...form, value: Number(e.target.value) })} /></div>
            <div className="form-row"><label>Prioridad</label><select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as Lead['priority'] })}><option value="high">Alta</option><option value="medium">Media</option><option value="low">Baja</option></select></div>
            <div className="form-row"><label>Notas</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} /></div>
            <div className="form-actions"><button className="modal-btn modal-btn--primary" onClick={save}>Guardar cambios</button></div>
          </div>
        ) : (
          <div className="modal-body">
            <div className="modal-info-grid">
              <InfoRow label="Email" value={lead.email} />
              <InfoRow label="Teléfono" value={lead.phone} />
              <InfoRow label="Coach" value={lead.coach} />
              <InfoRow label="Programa" value={lead.program} />
              <InfoRow label="Valor" value={`${formatCurrency(lead.value)}/mes`} />
              <InfoRow label="Registro" value={formatDate(lead.createdAt)} />
              <InfoRow label="Prioridad" value={lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)} />
              {lead.notes && <InfoRow label="Notas" value={lead.notes} />}
            </div>

            <div className="modal-section">
              <h4>Etiquetas</h4>
              <div className="lead-tags">
                {lead.tags.length > 0
                  ? lead.tags.map(t => <span key={t} className="lead-tag" style={{ color: TAG_COLORS[t] ?? '#94a3b8', borderColor: (TAG_COLORS[t] ?? '#94a3b8') + '44' }}>{t}</span>)
                  : <span className="modal-empty-tag">Sin etiquetas</span>}
              </div>
            </div>

            <div className="modal-section">
              <h4>Mover etapa</h4>
              <div className="stage-move-grid">
                {STAGES.map((s, i) => (
                  <button key={s.key} className={`stage-move-btn ${lead.stage === s.key ? 'stage-move-btn--active' : ''}`} style={{ '--sc': s.color } as React.CSSProperties} onClick={() => onMove(s.key)} disabled={lead.stage === s.key}>
                    <span className="stage-move-dot" style={{ background: s.color }} />
                    {s.label}
                    {i < currentIdx && ' ◂'}
                    {i > currentIdx && ' ▸'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="info-row"><span className="info-label">{label}</span><span className="info-value">{value}</span></div>
}

interface AddProps {
  onClose: () => void
  onAdd: (lead: Lead) => void
}

function AddLeadModal({ onClose, onAdd }: AddProps) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', coach: COACHES[0],
    program: PROGRAMS[0], value: 2000, stage: 'lead' as Stage,
    tags: '', notes: '', priority: 'medium' as Lead['priority'],
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) return
    const newLead: Lead = {
      id: Date.now().toString(),
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      coach: form.coach,
      program: form.program,
      value: form.value,
      stage: form.stage,
      createdAt: new Date().toISOString().slice(0, 10),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      notes: form.notes.trim(),
      priority: form.priority,
    }
    onAdd(newLead)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-block">
            <h2 className="modal-name">Nuevo Lead</h2>
            <span className="modal-program">Añadir prospecto al pipeline</span>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form className="modal-form" onSubmit={submit}>
          <div className="form-row"><label>Nombre *</label><input placeholder="Nombre completo" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="form-row"><label>Email *</label><input type="email" placeholder="email@ejemplo.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
          <div className="form-row"><label>Teléfono</label><input placeholder="+34 600 000 000" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="form-row"><label>Coach</label><select value={form.coach} onChange={e => setForm({ ...form, coach: e.target.value })}>{COACHES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div className="form-row"><label>Programa</label><select value={form.program} onChange={e => setForm({ ...form, program: e.target.value })}>{PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
          <div className="form-row"><label>Valor (€/mes)</label><input type="number" min="0" value={form.value} onChange={e => setForm({ ...form, value: Number(e.target.value) })} /></div>
          <div className="form-row"><label>Etapa inicial</label><select value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value as Stage })}>{STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}</select></div>
          <div className="form-row"><label>Prioridad</label><select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as Lead['priority'] })}><option value="high">Alta</option><option value="medium">Media</option><option value="low">Baja</option></select></div>
          <div className="form-row"><label>Etiquetas (separadas por coma)</label><input placeholder="corporativo, vip, urgente..." value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} /></div>
          <div className="form-row"><label>Notas</label><textarea placeholder="Observaciones..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} /></div>
          <div className="form-actions">
            <button type="button" className="modal-btn modal-btn--ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="modal-btn modal-btn--primary">Añadir Lead</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', pointerEvents: 'none' }}>
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
