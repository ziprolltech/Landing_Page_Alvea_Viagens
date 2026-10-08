'use client'

import { motion } from 'framer-motion'

/* ── Shared filter types (imported by BookingModal) ───────────────────────── */

export type Period  = 'morning' | 'afternoon' | 'evening' | 'night'
export type SortKey = 'price' | 'duration' | 'earliest' | 'latest'

export interface FilterState {
  stops:  number[]  // 0 = direct · 1 = 1 stop · 2 = 2+ stops (matched as >= 2)
  period: Period[]  // departure time window
  sort:   SortKey
}

export const DEFAULT_FILTERS: FilterState = {
  stops:  [],
  period: [],
  sort:   'price',
}

/* ── Props ────────────────────────────────────────────────────────────────── */

interface FlightFiltersProps {
  filters:     FilterState
  onChange:    (f: FilterState) => void
  resultCount: number
}

/* ── Pill button ──────────────────────────────────────────────────────────── */

function Pill({
  active, label, onClick,
}: { active: boolean; label: string; onClick: () => void }) {
  return (
    <motion.button
      className="shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold"
      style={{
        background:   active ? 'rgba(212,168,83,0.18)' : 'rgba(255,255,255,0.05)',
        border:       `1px solid ${active ? 'rgba(212,168,83,0.40)' : 'rgba(255,255,255,0.09)'}`,
        color:        active ? '#D4A853' : 'rgba(255,255,255,0.48)',
        transition:   'background 0.14s, border-color 0.14s, color 0.14s',
      }}
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.12 }}
    >
      {label}
    </motion.button>
  )
}

/* ── Section label ────────────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="shrink-0 text-[9.5px] font-semibold tracking-[0.12em] uppercase"
      style={{ color: 'rgba(255,255,255,0.28)' }}
    >
      {children}
    </span>
  )
}

/* ── Toggle helpers ───────────────────────────────────────────────────────── */

function toggleArr<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]
}

/* ── Label maps ───────────────────────────────────────────────────────────── */

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'price',    label: 'Preço'     },
  { key: 'duration', label: 'Duração'   },
  { key: 'earliest', label: 'Mais cedo' },
  { key: 'latest',   label: 'Mais tarde'},
]

const PERIOD_OPTIONS: { key: Period; label: string }[] = [
  { key: 'night',     label: 'Madrugada' },
  { key: 'morning',   label: 'Manhã'     },
  { key: 'afternoon', label: 'Tarde'     },
  { key: 'evening',   label: 'Noite'     },
]

/* ── Component ────────────────────────────────────────────────────────────── */

export default function FlightFilters({
  filters, onChange, resultCount,
}: FlightFiltersProps) {
  const set = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch })

  return (
    <div className="flex flex-col gap-1.5">

      {/* Row: sort + result count */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
        <SectionLabel>Ordenar</SectionLabel>
        {SORT_OPTIONS.map(opt => (
          <Pill
            key={opt.key}
            label={opt.label}
            active={filters.sort === opt.key}
            onClick={() => set({ sort: opt.key })}
          />
        ))}
        <span
          className="ml-auto shrink-0 text-[10px] tabular-nums"
          style={{ color: 'rgba(255,255,255,0.22)' }}
        >
          {resultCount} {resultCount === 1 ? 'voo' : 'voos'}
        </span>
      </div>

      {/* Row: stops */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
        <SectionLabel>Escalas</SectionLabel>
        {[
          { n: 0, label: 'Direto'   },
          { n: 1, label: '1 parada' },
          { n: 2, label: '2+'       },
        ].map(({ n, label }) => (
          <Pill
            key={n}
            label={label}
            active={filters.stops.includes(n)}
            onClick={() => set({ stops: toggleArr(filters.stops, n) })}
          />
        ))}
      </div>

      {/* Row: departure period */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
        <SectionLabel>Partida</SectionLabel>
        {PERIOD_OPTIONS.map(opt => (
          <Pill
            key={opt.key}
            label={opt.label}
            active={filters.period.includes(opt.key)}
            onClick={() => set({ period: toggleArr(filters.period, opt.key) })}
          />
        ))}
      </div>

    </div>
  )
}
