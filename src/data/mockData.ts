export type Stage = 'lead' | 'contacted' | 'discovery' | 'proposal' | 'enrolled' | 'active'
export type Priority = 'low' | 'medium' | 'high'

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  coach: string
  program: string
  value: number
  stage: Stage
  createdAt: string
  tags: string[]
  notes: string
  priority: Priority
}

export interface StageConfig {
  key: Stage
  label: string
  color: string
  description: string
}

export const STAGES: StageConfig[] = [
  { key: 'lead',      label: 'Lead',           color: '#6366f1', description: 'Nuevo prospecto' },
  { key: 'contacted', label: 'Contactado',     color: '#f59e0b', description: 'Primer contacto realizado' },
  { key: 'discovery', label: 'Discovery',      color: '#0ea5e9', description: 'Call de descubrimiento' },
  { key: 'proposal',  label: 'Propuesta',      color: '#8b5cf6', description: 'Oferta enviada' },
  { key: 'enrolled',  label: 'Inscrito',       color: '#10b981', description: 'Contrato firmado' },
  { key: 'active',    label: 'Cliente Activo', color: '#22c55e', description: 'En programa activo' },
]

export const COACHES = ['Ana López', 'Pedro Martín', 'Sofía Ruiz', 'Javier Torres']
export const PROGRAMS = ['Liderazgo Ejecutivo', 'Business Mastery', 'Mindset Pro', 'High Performance']

export const INITIAL_LEADS: Lead[] = [
  { id: '1',  name: 'María García',     email: 'maria@gmail.com',       phone: '+34 611 234 567', coach: 'Ana López',     program: 'Liderazgo Ejecutivo', value: 2500, stage: 'lead',      createdAt: '2025-04-28', tags: ['corporativo', 'urgente'], notes: 'Referida por Carlos M.',                           priority: 'high'   },
  { id: '2',  name: 'Carlos Rodríguez', email: 'carlos@empresa.com',    phone: '+34 622 345 678', coach: 'Pedro Martín',  program: 'Business Mastery',    value: 3500, stage: 'lead',      createdAt: '2025-04-30', tags: ['startup'],               notes: 'CEO de startup tech',                               priority: 'medium' },
  { id: '3',  name: 'Laura Sánchez',    email: 'laura@outlook.com',     phone: '+34 633 456 789', coach: 'Ana López',     program: 'Mindset Pro',         value: 1800, stage: 'lead',      createdAt: '2025-05-01', tags: ['personal'],              notes: '',                                                  priority: 'low'    },
  { id: '4',  name: 'Diego Martínez',   email: 'diego@corp.es',         phone: '+34 644 567 890', coach: 'Pedro Martín',  program: 'Liderazgo Ejecutivo', value: 4000, stage: 'contacted', createdAt: '2025-04-20', tags: ['corporativo'],           notes: 'Respondió correo, interesado en programa 3 meses', priority: 'high'   },
  { id: '5',  name: 'Elena Fernández',  email: 'elena@gmail.com',       phone: '+34 655 678 901', coach: 'Sofía Ruiz',    program: 'Mindset Pro',         value: 2200, stage: 'contacted', createdAt: '2025-04-25', tags: ['personal', 'online'],    notes: '',                                                  priority: 'medium' },
  { id: '6',  name: 'Roberto Jiménez',  email: 'roberto@business.com',  phone: '+34 666 789 012', coach: 'Ana López',     program: 'Business Mastery',    value: 5000, stage: 'discovery', createdAt: '2025-04-10', tags: ['corporativo', 'vip'],    notes: 'Call el Viernes 3pm',                               priority: 'high'   },
  { id: '7',  name: 'Patricia López',   email: 'patricia@gmail.com',    phone: '+34 677 890 123', coach: 'Pedro Martín',  program: 'Liderazgo Ejecutivo', value: 3200, stage: 'discovery', createdAt: '2025-04-15', tags: ['startup'],               notes: 'Busca programa intensivo',                          priority: 'medium' },
  { id: '8',  name: 'Andrés Torres',    email: 'andres@empresa.es',     phone: '+34 688 901 234', coach: 'Sofía Ruiz',    program: 'Business Mastery',    value: 6500, stage: 'proposal',  createdAt: '2025-03-28', tags: ['vip', 'corporativo'],    notes: 'Esperando aprobación de dirección',                 priority: 'high'   },
  { id: '9',  name: 'Isabel Moreno',    email: 'isabel@outlook.com',    phone: '+34 699 012 345', coach: 'Ana López',     program: 'Mindset Pro',         value: 2800, stage: 'proposal',  createdAt: '2025-04-01', tags: ['personal'],              notes: '',                                                  priority: 'medium' },
  { id: '10', name: 'Francisco Ruiz',   email: 'fran@corp.com',         phone: '+34 611 123 456', coach: 'Pedro Martín',  program: 'Liderazgo Ejecutivo', value: 4500, stage: 'enrolled',  createdAt: '2025-03-15', tags: ['corporativo', 'vip'],    notes: 'Inicia el 1 de Mayo',                               priority: 'high'   },
  { id: '11', name: 'Carmen Vega',      email: 'carmen@gmail.com',      phone: '+34 622 234 567', coach: 'Sofía Ruiz',    program: 'Business Mastery',    value: 5500, stage: 'active',    createdAt: '2025-02-01', tags: ['vip'],                   notes: 'Mes 3 de 6 — resultados excelentes',               priority: 'medium' },
  { id: '12', name: 'Miguel Herrera',   email: 'miguel@empresa.com',    phone: '+34 633 345 678', coach: 'Ana López',     program: 'High Performance',    value: 3800, stage: 'active',    createdAt: '2025-03-01', tags: ['corporativo'],           notes: 'Renovación en Julio',                               priority: 'low'    },
  { id: '13', name: 'Lucía Ramírez',    email: 'lucia@startup.io',      phone: '+34 644 456 789', coach: 'Javier Torres', program: 'Business Mastery',    value: 4200, stage: 'active',    createdAt: '2025-01-15', tags: ['startup', 'vip'],        notes: 'Mes 4 de 6',                                        priority: 'high'   },
]

export function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}
