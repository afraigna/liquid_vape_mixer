import { useState } from 'react'
import { MixParams, AromeMix, MixResult } from '../types'
import { fmt } from '../utils/calculator'

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 0.15s ease',
        flexShrink: 0,
      }}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

interface Props {
  result: MixResult
  params: MixParams
  aromeMixes: AromeMix[]
  onCopy: () => void
  onSave: () => void
}

const COLORS = {
  pg: '#B7B4A6',
  vg: '#9B9890',
  nic: '#D4537E',
}

export default function RecipeSummary({ result, params, onCopy, onSave }: Props) {
  const [copied, setCopied] = useState(false)
  const [baseOpen, setBaseOpen] = useState(false)

  const handleCopy = async () => {
    await onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const ratioVG = 100 - params.ratioPG

  const segs = [
    { label: 'Base PG', ml: result.volumePG, color: COLORS.pg },
    { label: 'Base VG', ml: result.volumeVG, color: COLORS.vg },
    { label: 'Nicotine', ml: result.volumeNicotine, color: COLORS.nic },
    ...result.volumeParArome.map((a) => ({
      label: a.arome.nom,
      ml: a.volume,
      color: a.arome.couleur,
    })),
  ].filter((s) => s.ml > 0)

  const barTotal = Math.max(0.0001, segs.reduce((s, x) => s + x.ml, 0))

  const V = params.volumeTotal
  const baseTotalMl = result.volumePG + result.volumeVG
  const baseTotalPct = V > 0 ? (baseTotalMl / V) * 100 : 0
  const otherRows = [
    {
      color: COLORS.nic,
      label: 'Nicotine',
      pct: V > 0 ? (result.volumeNicotine / V) * 100 : 0,
      ml: result.volumeNicotine,
    },
    ...result.volumeParArome.map((a) => ({
      color: a.arome.couleur,
      label: a.arome.nom,
      pct: V > 0 ? (a.volume / V) * 100 : 0,
      ml: a.volume,
    })),
  ]

  return (
    <section
      className="bg-white rounded-xl p-5 mb-4"
      style={{ border: '0.5px solid #D3D1C7' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: '#888780' }}>
          Résumé de la recette
        </span>
        <span className="text-[11px]" style={{ color: '#888780', fontFamily: 'JetBrains Mono, monospace' }}>
          PG {params.ratioPG} / VG {ratioVG}
        </span>
      </div>

      {/* 3 stats */}
      <div className="grid grid-cols-3 gap-2.5 mb-3.5">
        <StatCard label="Volume final" value={fmt(params.volumeTotal, 1)} unit="ml" sub={`PG ${params.ratioPG} / VG ${ratioVG}`} />
        <StatCard
          label="Nicotine"
          value={fmt(params.nicotineCible, 1)}
          unit="mg/ml"
          sub={`${fmt(result.volumeNicotine, 2)} ml booster`}
        />
        <StatCard
          label="Arômes"
          value={fmt(result.totalDosePct, 1)}
          unit="%"
          sub={`${fmt(result.volumeAromesTotal, 2)} ml total`}
        />
      </div>

      {/* Barre empilée */}
      <div className="mt-1">
        <div className="flex gap-3.5 flex-wrap mb-2" style={{ fontSize: '11.5px', color: '#56554F', fontVariantNumeric: 'tabular-nums' }}>
          <LegendItem color={COLORS.pg} label="Base PG" ml={result.volumePG} />
          <LegendItem color={COLORS.vg} label="Base VG" ml={result.volumeVG} />
          <LegendItem color={COLORS.nic} label="Nicotine" ml={result.volumeNicotine} />
          {result.volumeParArome.map((a) => (
            <LegendItem key={a.arome.id} color={a.arome.couleur} label={a.arome.nom} ml={a.volume} />
          ))}
        </div>
        <div
          className="flex w-full h-[18px] rounded-[6px] overflow-hidden"
          style={{ background: '#EFEDE6', border: '0.5px solid #E8E6DE' }}
        >
          {segs.map((s, i) => (
            <div
              key={i}
              style={{
                flex: `${(s.ml / barTotal) * 100} 0 0`,
                background: s.color,
                transition: 'flex-basis .25s ease',
              }}
              title={`${s.label} — ${fmt(s.ml, 2)} ml`}
            />
          ))}
        </div>
      </div>

      {/* Tableau récapitulatif */}
      <div className="mt-4 pt-3.5" style={{ borderTop: '0.5px solid #E8E6DE' }}>

        {/* Ligne Base — cliquable, expand/collapse */}
        <button
          onClick={() => setBaseOpen((o) => !o)}
          className="w-full flex items-center gap-3 py-1.5 text-[12.5px] cursor-pointer text-left"
          style={{
            border: 'none',
            borderBottom: baseOpen ? 'none' : '0.5px dashed #E8E6DE',
            background: 'transparent',
            padding: '6px 0',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#FAFAF8')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <span
            className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
            style={{ background: COLORS.pg }}
          />
          <span className="flex-1 flex items-center gap-1.5" style={{ color: '#56554F' }}>
            Base {params.ratioPG}/{ratioVG}
            <span style={{ color: '#888780', marginLeft: 2 }}>
              <ChevronIcon open={baseOpen} />
            </span>
          </span>
          <span
            className="w-[54px] text-right text-[11px]"
            style={{ color: '#888780', fontFamily: 'JetBrains Mono, monospace', fontVariantNumeric: 'tabular-nums' }}
          >
            {fmt(baseTotalPct, 1)} %
          </span>
          <span
            className="min-w-[60px] text-right font-semibold"
            style={{ color: '#2C2C2A', fontVariantNumeric: 'tabular-nums' }}
          >
            {fmt(baseTotalMl, 1)}
            <em className="not-italic font-medium text-[10.5px] ml-0.5" style={{ color: '#888780', fontFamily: 'JetBrains Mono, monospace' }}>
              ml
            </em>
          </span>
        </button>

        {/* Détail PG / VG (visible si ouvert) */}
        {baseOpen && (
          <div
            className="mb-1"
            style={{
              borderBottom: '0.5px dashed #E8E6DE',
              background: '#FAFAF8',
              borderRadius: '0 0 6px 6px',
            }}
          >
            <SubRow
              color={COLORS.pg}
              label={`PG`}
              pct={V > 0 ? (result.volumePG / V) * 100 : 0}
              ml={result.volumePG}
            />
            <SubRow
              color={COLORS.vg}
              label={`VG`}
              pct={V > 0 ? (result.volumeVG / V) * 100 : 0}
              ml={result.volumeVG}
            />
          </div>
        )}

        {/* Autres lignes */}
        {otherRows.map((row, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-1.5 text-[12.5px]"
            style={{ borderBottom: '0.5px dashed #E8E6DE' }}
          >
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ background: row.color }}
            />
            <span className="flex-1" style={{ color: '#56554F' }}>{row.label}</span>
            <span
              className="w-[54px] text-right text-[11px]"
              style={{ color: '#888780', fontFamily: 'JetBrains Mono, monospace', fontVariantNumeric: 'tabular-nums' }}
            >
              {fmt(row.pct, 1)} %
            </span>
            <span
              className="min-w-[60px] text-right font-semibold"
              style={{ color: '#2C2C2A', fontVariantNumeric: 'tabular-nums' }}
            >
              {fmt(row.ml, 1)}
              <em className="not-italic font-medium text-[10.5px] ml-0.5" style={{ color: '#888780', fontFamily: 'JetBrains Mono, monospace' }}>
                ml
              </em>
            </span>
          </div>
        ))}

        {/* Total */}
        <div
          className="flex items-center gap-3 py-2 mt-1.5 font-semibold text-[12.5px]"
          style={{ borderTop: '0.5px solid #D3D1C7' }}
        >
          <span className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="flex-1" style={{ color: '#56554F' }}>Total</span>
          <span className="w-[54px] text-right text-[11px]" style={{ color: '#888780', fontFamily: 'JetBrains Mono, monospace' }}>
            100.0 %
          </span>
          <span
            className="min-w-[60px] text-right font-semibold text-[14px]"
            style={{ color: '#2C2C2A', fontVariantNumeric: 'tabular-nums' }}
          >
            {fmt(params.volumeTotal, 1)}
            <em className="not-italic font-medium text-[10.5px] ml-0.5" style={{ color: '#888780', fontFamily: 'JetBrains Mono, monospace' }}>
              ml
            </em>
          </span>
        </div>
      </div>

      {/* Badge validation */}
      {result.isValid ? (
        <div
          className="mt-3.5 flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium"
          style={{ background: '#E6F4ED', border: '0.5px solid #CDE5D8', color: '#1D6E4F' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Recette valide
        </div>
      ) : (
        <div
          className="mt-3.5 flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium"
          style={{ background: '#FBEEE6', border: '0.5px solid #EFD9C7', color: '#8A3A14' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Volume dépassé — réduire les dosages
        </div>
      )}

      {/* Boutons */}
      <div className="flex gap-2.5 justify-end mt-3.5">
        <button
          onClick={handleCopy}
          className="h-9 px-4 rounded-lg text-[12.5px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          style={{ background: '#fff', border: '0.5px solid #D3D1C7', color: '#2C2C2A' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#FAF9F5')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
        >
          {copied ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Copié !
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1"/>
              </svg>
              Copier
            </>
          )}
        </button>

        <button
          onClick={onSave}
          className="h-9 px-4 rounded-lg text-[12.5px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          style={{ background: '#2C2C2A', border: '0.5px solid #2C2C2A', color: '#fff' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#1A1A18')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#2C2C2A')}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          Enregistrer
        </button>
      </div>
    </section>
  )
}

function StatCard({ label, value, unit, sub }: { label: string; value: string; unit: string; sub: string }) {
  return (
    <div
      className="rounded-[10px] p-3"
      style={{ border: '0.5px solid #E8E6DE', background: '#FCFBF8' }}
    >
      <div className="text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: '#888780' }}>
        {label}
      </div>
      <div className="mt-1.5 text-[20px] font-semibold" style={{ color: '#2C2C2A', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>
        {value}
        <em className="not-italic font-medium text-[12px] ml-1" style={{ color: '#888780', fontFamily: 'JetBrains Mono, monospace' }}>
          {unit}
        </em>
      </div>
      <div className="text-[10.5px] mt-0.5" style={{ color: '#888780', fontFamily: 'JetBrains Mono, monospace' }}>
        {sub}
      </div>
    </div>
  )
}

function SubRow({ color, label, pct, ml }: { color: string; label: string; pct: number; ml: number }) {
  return (
    <div
      className="flex items-center gap-3 py-1 text-[11.5px] pl-6"
      style={{ color: '#888780' }}
    >
      <span
        className="w-2 h-2 rounded-[2px] flex-shrink-0"
        style={{ background: color, opacity: 0.7 }}
      />
      <span className="flex-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{label}</span>
      <span
        className="w-[54px] text-right text-[11px]"
        style={{ fontFamily: 'JetBrains Mono, monospace', fontVariantNumeric: 'tabular-nums' }}
      >
        {fmt(pct, 1)} %
      </span>
      <span
        className="min-w-[60px] text-right"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {fmt(ml, 1)}
        <em className="not-italic text-[10.5px] ml-0.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          ml
        </em>
      </span>
    </div>
  )
}

function LegendItem({ color, label, ml }: { color: string; label: string; ml: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-[2px] inline-block flex-shrink-0" style={{ background: color }} />
      <strong className="font-semibold" style={{ color: '#2C2C2A' }}>{label}</strong>
      <em className="not-italic" style={{ color: '#888780', fontFamily: 'JetBrains Mono, monospace', fontSize: '10.5px', marginLeft: 4 }}>
        {fmt(ml, 2)} ml
      </em>
    </span>
  )
}
