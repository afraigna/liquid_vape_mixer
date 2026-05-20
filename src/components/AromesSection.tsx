import { AromeMix, DoseMode, MixResult, Arome } from '../types'
import { fmt } from '../utils/calculator'
import MultiSlider from './MultiSlider'

interface Props {
  aromeMixes: AromeMix[]
  doseMode: DoseMode
  result: MixResult
  onDoseModeChange: (m: DoseMode) => void
  onSharesChange: (shares: number[]) => void
  onRemoveArome: (id: number) => void
  onOpenModal: () => void
  onUpdateArome: (arome: Arome) => void
}

function BottleSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
      <rect x="9" y="2" width="6" height="3" rx="1" fill="#9B9A92"/>
      <path d="M8 6.5h8a1 1 0 0 1 1 1V9c0 .6.4 1.1.9 1.4 1.6 1 2.6 2.7 2.6 4.7V19a3 3 0 0 1-3 3H6.5a3 3 0 0 1-3-3v-3.9c0-2 1-3.7 2.6-4.7.5-.3.9-.8.9-1.4V7.5a1 1 0 0 1 1-1Z" fill={color} opacity="0.85"/>
      <rect x="6" y="13" width="12" height="6" rx="1.5" fill="#fff" opacity="0.18"/>
    </svg>
  )
}

function Thumb({ arome }: { arome: Arome }) {
  if (arome.image_url) {
    return (
      <img
        src={arome.image_url}
        alt=""
        className="w-full h-full object-cover block"
        onError={(e) => {
          const img = e.currentTarget
          const parent = img.parentElement
          if (parent) {
            parent.innerHTML = ''
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
            parent.appendChild(svg)
          }
        }}
      />
    )
  }
  return <BottleSVG color={arome.couleur} />
}

export default function AromesSection({
  aromeMixes,
  doseMode,
  result,
  onDoseModeChange,
  onSharesChange,
  onRemoveArome,
  onOpenModal,
  onUpdateArome: _onUpdateArome,
}: Props) {
  const shares = aromeMixes.map((m) => m.share)
  const colors = aromeMixes.map((m) => m.arome.couleur)
  const shareSum = shares.reduce((s, v) => s + v, 0)
  const shareOk = aromeMixes.length === 0 || Math.abs(shareSum - 100) < 0.05

  return (
    <section
      className="bg-white rounded-xl p-5 mb-4"
      style={{ border: '0.5px solid #D3D1C7' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5 gap-2.5">
        <span
          className="text-[11px] font-semibold tracking-widest uppercase"
          style={{ color: '#888780' }}
        >
          Arômes
        </span>

        <div className="flex items-center gap-2.5">
          {/* Toggle dosage */}
          <div
            className="inline-flex rounded-[7px] overflow-hidden bg-white"
            style={{ border: '0.5px solid #D3D1C7' }}
          >
            {(['rec', 'cust'] as DoseMode[]).map((mode, i) => (
              <button
                key={mode}
                onClick={() => onDoseModeChange(mode)}
                className="h-[26px] px-2.5 text-[11px] font-medium cursor-pointer transition-colors"
                style={{
                  border: 'none',
                  borderRight: i === 0 ? '0.5px solid #D3D1C7' : 'none',
                  background: doseMode === mode ? '#E6F1FB' : 'transparent',
                  color: doseMode === mode ? '#185FA5' : '#888780',
                  fontWeight: doseMode === mode ? 600 : 500,
                }}
              >
                {mode === 'rec' ? 'Conseillé' : 'Personnalisé'}
              </button>
            ))}
          </div>

          {/* Chip total dosage */}
          <div
            className="text-[11px] font-semibold rounded-[6px] px-2 py-0.5"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontVariantNumeric: 'tabular-nums',
              background: '#F4F2EC',
              border: '0.5px solid #E8E6DE',
              color: '#56554F',
            }}
          >
            <span style={{ color: '#888780', fontWeight: 500, marginRight: 4 }}>Total</span>
            {fmt(result.totalDosePct, 1)} %
          </div>
        </div>
      </div>

      {/* Liste des arômes */}
      {aromeMixes.length === 0 ? (
        <div className="py-4 text-center text-[12px]" style={{ color: '#888780' }}>
          Aucun arôme — ajoutez-en depuis la bibliothèque ci-dessous.
        </div>
      ) : (
        <div>
          {aromeMixes.map((mix, i) => {
            const ar = result.volumeParArome[i]
            return (
              <div
                key={mix.arome.id}
                className="flex items-center gap-2.5 py-2.5"
                style={{
                  borderBottom: i < aromeMixes.length - 1 ? '0.5px solid #E8E6DE' : 'none',
                  display: 'grid',
                  gridTemplateColumns: '14px 28px 1fr auto 70px 22px',
                  gap: 10,
                }}
              >
                {/* Dot */}
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    background: mix.arome.couleur,
                    boxShadow: 'inset 0 0 0 .5px rgba(0,0,0,.12)',
                  }}
                />

                {/* Thumb image */}
                <div
                  className="w-7 h-7 rounded-[7px] overflow-hidden flex items-center justify-center flex-shrink-0"
                  style={{
                    background: '#F4F2EC',
                    border: '0.5px solid #E8E6DE',
                  }}
                >
                  <Thumb arome={mix.arome} />
                </div>

                {/* Nom + sous-titre dosage */}
                <div className="min-w-0 flex items-baseline gap-1.5 overflow-hidden">
                  <span
                    className="text-[13px] font-medium truncate"
                    style={{ color: '#2C2C2A' }}
                  >
                    {mix.arome.nom}
                  </span>
                  <span
                    className="text-[10.5px] flex-shrink-0"
                    style={{
                      color: '#888780',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    {fmt(ar?.dosageEffectif ?? 0, 1)}%{' '}
                    {doseMode === 'cust' ? 'perso' : 'conseil'}
                  </span>
                </div>

                {/* Part % (lecture seule) */}
                <div
                  className="text-[12.5px] font-semibold text-right"
                  style={{
                    color: '#2C2C2A',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontVariantNumeric: 'tabular-nums',
                    minWidth: 42,
                  }}
                >
                  {mix.share.toFixed(0)}%
                </div>

                {/* Volume ml */}
                <div
                  className="text-[13px] font-bold text-right"
                  style={{ color: '#2C2C2A', fontVariantNumeric: 'tabular-nums' }}
                >
                  {fmt(ar?.volume ?? 0, 1)}
                  <em
                    className="not-italic font-medium text-[10.5px] ml-0.5"
                    style={{ color: '#888780', fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    ml
                  </em>
                </div>

                {/* Supprimer */}
                <button
                  onClick={() => onRemoveArome(mix.arome.id)}
                  className="w-[22px] h-[22px] rounded-[6px] flex items-center justify-center cursor-pointer transition-colors"
                  style={{ background: 'transparent', border: 'none', color: '#888780' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F1EFE7'
                    e.currentTarget.style.color = '#BA4A1A'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#888780'
                  }}
                  aria-label="Retirer"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            )
          })}

          {/* Slider multi-curseurs */}
          {aromeMixes.length > 1 && (
            <MultiSlider
              shares={shares}
              colors={colors}
              onChange={onSharesChange}
            />
          )}
        </div>
      )}

      {/* Footer */}
      <div
        className="mt-3.5 pt-3.5 flex justify-between items-center gap-2.5"
        style={{ borderTop: '0.5px dashed #D3D1C7' }}
      >
        <span
          className="text-[11.5px]"
          style={{ color: shareOk ? '#888780' : '#BA4A1A' }}
        >
          {aromeMixes.length === 0
            ? 'Aucun arôme dans la recette'
            : `Parts d'arômes — Total ${fmt(shareSum, 1)} %${!shareOk ? ' (doit faire 100 %)' : ''}`}
        </span>

        <button
          onClick={onOpenModal}
          className="h-8 px-3.5 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          style={{
            border: '0.5px solid #185FA5',
            background: '#E6F1FB',
            color: '#185FA5',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#D8E8F8')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#E6F1FB')}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Ajouter un arôme
        </button>
      </div>
    </section>
  )
}
