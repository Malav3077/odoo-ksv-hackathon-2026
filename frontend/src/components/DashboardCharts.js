'use client'
import { useState } from 'react'

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

// Semantic status palette — each slice is ALWAYS shown with a text label + count,
// so identity is never carried by color alone (status-palette contract).
const STATUS_COLORS = {
  quotation: '#94a3b8',
  quotation_sent: '#64748b',
  reserved: '#6366f1',
  picked_up: '#06b6d4',
  late_pickup: '#f59e0b',
  returned: '#16a34a',
  late_return: '#ef4444',
  cancelled: '#9ca3af',
}

function Panel({ title, subtitle, right, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  )
}

function EmptyState({ label }) {
  return <div className="flex h-48 items-center justify-center text-sm text-gray-400">{label}</div>
}

/* ── Revenue trend: area + line with crosshair tooltip ───────────────── */
export function RevenueTrendChart({ data = [], loading }) {
  const [hover, setHover] = useState(null)
  const W = 720
  const H = 240
  const P = { t: 16, r: 16, b: 28, l: 48 }
  const iw = W - P.l - P.r
  const ih = H - P.t - P.b

  const total = data.reduce((s, d) => s + (d.revenue || 0), 0)
  const max = Math.max(1, ...data.map((d) => d.revenue || 0))
  const nice = Math.ceil(max / 4) * 4 || 4
  const x = (i) => P.l + (data.length <= 1 ? iw / 2 : (i / (data.length - 1)) * iw)
  const y = (v) => P.t + ih - (v / nice) * ih

  const linePts = data.map((d, i) => `${x(i)},${y(d.revenue)}`).join(' ')
  const areaPts = `${P.l},${P.t + ih} ${linePts} ${P.l + iw},${P.t + ih}`

  function move(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const rel = ((e.clientX - rect.left) / rect.width) * W
    let idx = Math.round(((rel - P.l) / iw) * (data.length - 1))
    idx = Math.max(0, Math.min(data.length - 1, idx))
    setHover(idx)
  }

  if (loading) return <div className="h-60 animate-pulse rounded-xl bg-gray-100" />
  if (!data.length || total === 0)
    return (
      <Panel title="Revenue (last 14 days)" subtitle="Order value booked per day">
        <EmptyState label="No revenue in this window yet." />
      </Panel>
    )

  const ticks = [0, nice / 2, nice]

  return (
    <Panel
      title="Revenue (last 14 days)"
      subtitle="Order value booked per day"
      right={
        <div className="text-right">
          <p className="text-xs text-gray-400">Total</p>
          <p className="text-lg font-bold text-indigo-600">{inr(total)}</p>
        </div>
      }
    >
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          onMouseMove={move}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>

          {ticks.map((t, i) => (
            <g key={i}>
              <line x1={P.l} x2={P.l + iw} y1={y(t)} y2={y(t)} stroke="#f1f5f9" strokeWidth="1" />
              <text x={P.l - 8} y={y(t) + 4} textAnchor="end" className="fill-gray-400" fontSize="11">
                {t >= 1000 ? `${t / 1000}k` : t}
              </text>
            </g>
          ))}

          <polygon points={areaPts} fill="url(#revFill)" />
          <polyline points={linePts} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

          {data.map((d, i) =>
            i % 2 === 0 || i === data.length - 1 ? (
              <text key={i} x={x(i)} y={H - 8} textAnchor="middle" className="fill-gray-400" fontSize="10">
                {d.label}
              </text>
            ) : null
          )}

          {hover != null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={P.t} y2={P.t + ih} stroke="#c7d2fe" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx={x(hover)} cy={y(data[hover].revenue)} r="5" fill="#6366f1" stroke="#fff" strokeWidth="2" />
            </g>
          )}
        </svg>

        {hover != null && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 rounded-lg bg-gray-900 px-2.5 py-1.5 text-center text-white shadow-lg"
            style={{ left: `${(x(hover) / W) * 100}%`, top: 0 }}
          >
            <p className="text-[10px] text-gray-300">{data[hover].label}</p>
            <p className="text-xs font-semibold">{inr(data[hover].revenue)}</p>
          </div>
        )}
      </div>
    </Panel>
  )
}

/* ── Order status donut ──────────────────────────────────────────────── */
export function StatusDonut({ data = [], loading }) {
  const [hover, setHover] = useState(null)
  const size = 168
  const cx = size / 2
  const cy = size / 2
  const r = 62
  const sw = 22
  const C = 2 * Math.PI * r
  const total = data.reduce((s, d) => s + d.count, 0)

  if (loading) return <div className="h-60 animate-pulse rounded-xl bg-gray-100" />

  let offset = 0
  const segs = data.map((d) => {
    const frac = total ? d.count / total : 0
    const seg = { ...d, frac, dash: frac * C, offset }
    offset += frac * C
    return seg
  })

  return (
    <Panel title="Order status" subtitle="Live distribution of all orders">
      {!total ? (
        <EmptyState label="No orders yet." />
      ) : (
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
          <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="-rotate-90">
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={sw} />
              {segs.map((s) => (
                <circle
                  key={s.status}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke={STATUS_COLORS[s.status] || '#9ca3af'}
                  strokeWidth={hover === s.status ? sw + 4 : sw}
                  strokeDasharray={`${s.dash} ${C - s.dash}`}
                  strokeDashoffset={-s.offset}
                  strokeLinecap="butt"
                  className="transition-all duration-200"
                  style={{ opacity: hover && hover !== s.status ? 0.35 : 1 }}
                  onMouseEnter={() => setHover(s.status)}
                  onMouseLeave={() => setHover(null)}
                />
              ))}
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-800">
                {hover ? data.find((d) => d.status === hover)?.count : total}
              </span>
              <span className="text-[11px] text-gray-400">
                {hover ? data.find((d) => d.status === hover)?.label : 'Total orders'}
              </span>
            </div>
          </div>

          <ul className="w-full space-y-1.5">
            {segs.map((s) => (
              <li
                key={s.status}
                className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-gray-50"
                onMouseEnter={() => setHover(s.status)}
                onMouseLeave={() => setHover(null)}
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: STATUS_COLORS[s.status] || '#9ca3af' }} />
                <span className="flex-1 text-sm text-gray-600">{s.label}</span>
                <span className="text-sm font-semibold text-gray-800">{s.count}</span>
                <span className="w-10 text-right text-xs text-gray-400">{Math.round(s.frac * 100)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  )
}

/* ── Top products horizontal bars ────────────────────────────────────── */
export function TopProductsBars({ data = [], loading }) {
  const [hover, setHover] = useState(null)
  if (loading) return <div className="h-60 animate-pulse rounded-xl bg-gray-100" />

  const rows = [...data].sort((a, b) => b.revenue - a.revenue)
  const max = Math.max(1, ...rows.map((d) => d.revenue))

  return (
    <Panel title="Top products" subtitle="By revenue booked">
      {!rows.length ? (
        <EmptyState label="No rentals yet." />
      ) : (
        <ul className="space-y-3">
          {rows.map((d, i) => (
            <li
              key={d.name + i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="truncate pr-2 font-medium text-gray-700">{d.name}</span>
                <span className="shrink-0 font-semibold text-gray-800">{inr(d.revenue)}</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${Math.max(4, (d.revenue / max) * 100)}%`, opacity: hover === null || hover === i ? 1 : 0.5 }}
                />
              </div>
              {hover === i && (
                <p className="mt-1 text-[11px] text-gray-400">
                  {d.quantity} unit{d.quantity !== 1 ? 's' : ''} rented · {inr(d.revenue)} revenue
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}
