import { useMemo } from 'react'
import { Lead, STAGES, formatCurrency } from '../data/mockData'
import './Dashboard.css'

interface Props {
  leads: Lead[]
}

export function Dashboard({ leads }: Props) {
  const stats = useMemo(() => {
    const total = leads.length
    const active = leads.filter(l => l.stage === 'active').length
    const pipeline = leads.filter(l => !['active', 'enrolled'].includes(l.stage)).length
    const mrr = leads.filter(l => l.stage === 'active').reduce((s, l) => s + l.value, 0)
    const pipelineValue = leads
      .filter(l => !['active'].includes(l.stage))
      .reduce((s, l) => s + l.value, 0)
    const conversionRate = total > 0 ? Math.round((active / total) * 100) : 0
    return { total, active, pipeline, mrr, pipelineValue, conversionRate }
  }, [leads])

  const byStage = useMemo(
    () => STAGES.map(s => ({
      ...s,
      leads: leads.filter(l => l.stage === s.key),
      value: leads.filter(l => l.stage === s.key).reduce((acc, l) => acc + l.value, 0),
    })),
    [leads]
  )

  const recentLeads = useMemo(
    () => [...leads].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    [leads]
  )

  const coachStats = useMemo(() => {
    const map = new Map<string, { count: number; value: number }>()
    leads.forEach(l => {
      const cur = map.get(l.coach) ?? { count: 0, value: 0 }
      map.set(l.coach, { count: cur.count + 1, value: cur.value + l.value })
    })
    return [...map.entries()]
      .map(([coach, d]) => ({ coach, ...d }))
      .sort((a, b) => b.value - a.value)
  }, [leads])

  return (
    <div className="dashboard">
      <div className="kpi-grid">
        <KpiCard label="MRR Activo" value={formatCurrency(stats.mrr)} sub="+12% vs mes anterior" trend="up" icon={<IconMoney />} color="#10b981" />
        <KpiCard label="Valor en Pipeline" value={formatCurrency(stats.pipelineValue)} sub={`${stats.pipeline} prospectos activos`} trend="up" icon={<IconPipe />} color="#8b5cf6" />
        <KpiCard label="Clientes Activos" value={String(stats.active)} sub="En programa actualmente" trend="neutral" icon={<IconUsers />} color="#38bdf8" />
        <KpiCard label="Tasa de Conversión" value={`${stats.conversionRate}%`} sub="Lead → Cliente activo" trend="up" icon={<IconChart />} color="#f59e0b" />
      </div>

      <div className="dashboard-body">
        <div className="dash-card dash-funnel">
          <div className="dash-card-header"><h3>Funnel de Ventas</h3></div>
          <div className="funnel-list">
            {byStage.map((s, i) => {
              const maxCount = Math.max(...byStage.map(x => x.leads.length), 1)
              const pct = s.leads.length / maxCount
              return (
                <div key={s.key} className="funnel-row">
                  <div className="funnel-row-meta">
                    <span className="funnel-dot" style={{ background: s.color }} />
                    <span className="funnel-label">{s.label}</span>
                    <span className="funnel-count">{s.leads.length}</span>
                  </div>
                  <div className="funnel-bar-wrap">
                    <div className="funnel-bar" style={{ width: `${Math.max(pct * 100, 4)}%`, background: s.color, opacity: 0.8 - i * 0.05 }} />
                  </div>
                  <span className="funnel-value">{formatCurrency(s.value)}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="dash-card dash-coaches">
          <div className="dash-card-header"><h3>Coaches</h3></div>
          <div className="coach-list">
            {coachStats.map((c, i) => (
              <div key={c.coach} className="coach-row">
                <span className="coach-rank">#{i + 1}</span>
                <div className="coach-avatar">{c.coach.split(' ').map(w => w[0]).join('')}</div>
                <div className="coach-info">
                  <span className="coach-name">{c.coach}</span>
                  <span className="coach-sub">{c.count} clientes</span>
                </div>
                <span className="coach-value">{formatCurrency(c.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-card dash-recent">
          <div className="dash-card-header"><h3>Últimos Registros</h3></div>
          <div className="recent-list">
            {recentLeads.map(l => {
              const stage = STAGES.find(s => s.key === l.stage)!
              return (
                <div key={l.id} className="recent-row">
                  <div className="recent-avatar">{l.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
                  <div className="recent-info">
                    <span className="recent-name">{l.name}</span>
                    <span className="recent-program">{l.program}</span>
                  </div>
                  <div className="recent-right">
                    <span className="stage-badge" style={{ '--dot': stage.color } as React.CSSProperties}>{stage.label}</span>
                    <span className="recent-value">{formatCurrency(l.value)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

interface KpiProps {
  label: string
  value: string
  sub: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
  color: string
}

function KpiCard({ label, value, sub, trend, icon, color }: KpiProps) {
  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <div className="kpi-icon" style={{ background: `${color}22`, color }}>{icon}</div>
        {trend !== 'neutral' && <span className={`kpi-trend kpi-trend--${trend}`}>{trend === 'up' ? '↑' : '↓'}</span>}
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-sub">{sub}</div>
    </div>
  )
}

function IconMoney() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
}
function IconPipe() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
}
function IconUsers() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
}
function IconChart() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
}
