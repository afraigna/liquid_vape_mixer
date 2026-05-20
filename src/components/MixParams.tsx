import { MixParams } from '../types'

const RATIOS: Array<{ label: string; value: number }> = [
  { label: '30/70', value: 30 },
  { label: '50/50', value: 50 },
  { label: '70/30', value: 70 },
  { label: '80/20', value: 80 },
  { label: '100/0', value: 100 },
]

interface Props {
  params: MixParams
  onChange: (p: MixParams) => void
}

export default function MixParamsSection({ params, onChange }: Props) {
  const set = (key: keyof MixParams, val: number) =>
    onChange({ ...params, [key]: val })

  return (
    <section
      className="bg-white rounded-xl p-5 mb-4"
      style={{ border: '0.5px solid #D3D1C7' }}
    >
      <div className="flex items-center justify-between mb-3.5">
        <span
          className="text-[11px] font-semibold tracking-widest uppercase"
          style={{ color: '#888780' }}
        >
          Paramètres du mélange
        </span>
        <span
          className="text-[11px]"
          style={{ color: '#888780', fontFamily: 'JetBrains Mono, monospace' }}
        >
          {params.volumeTotal} ml · {params.nicotineCible} mg/ml
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <NumField
          label="Volume total"
          value={params.volumeTotal}
          unit="ml"
          min={1}
          step={1}
          onChange={(v) => set('volumeTotal', v)}
        />
        <NumField
          label="Nicotine cible"
          value={params.nicotineCible}
          unit="mg/ml"
          min={0}
          step={0.5}
          onChange={(v) => set('nicotineCible', v)}
        />
        <NumField
          label="Booster nicotine"
          value={params.boosterNicotine}
          unit="mg/ml"
          min={1}
          step={1}
          onChange={(v) => set('boosterNicotine', v)}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-[11.5px] font-medium" style={{ color: '#56554F' }}>
          Ratio{' '}
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10.5px', color: '#888780' }}>
            PG / VG
          </span>
        </span>

        <div
          className="inline-flex rounded-lg overflow-hidden bg-white"
          style={{ border: '0.5px solid #D3D1C7' }}
        >
          {RATIOS.map((r, i) => (
            <button
              key={r.value}
              onClick={() => set('ratioPG', r.value)}
              className="h-[30px] px-3 text-[12px] font-medium cursor-pointer transition-colors"
              style={{
                fontVariantNumeric: 'tabular-nums',
                border: 'none',
                borderRight: i < RATIOS.length - 1 ? '0.5px solid #D3D1C7' : 'none',
                background: params.ratioPG === r.value ? '#E6F1FB' : 'transparent',
                color: params.ratioPG === r.value ? '#185FA5' : '#888780',
                fontWeight: params.ratioPG === r.value ? 600 : 500,
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

interface NumFieldProps {
  label: string
  value: number
  unit: string
  min: number
  step: number
  onChange: (v: number) => void
}

function NumField({ label, value, unit, min, step, onChange }: NumFieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11.5px] font-medium" style={{ color: '#56554F' }}>
        {label}
      </span>
      <div
        className="flex items-center h-[38px] px-3 rounded-lg bg-white transition-shadow"
        style={{ border: '0.5px solid #D3D1C7' }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#185FA5'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(24,95,165,.10)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#D3D1C7'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(e) => {
            const v = parseFloat(e.target.value)
            if (isFinite(v)) onChange(v)
          }}
          className="flex-1 border-0 outline-none bg-transparent text-[15px] font-semibold w-full p-0"
          style={{ color: '#2C2C2A' }}
        />
        <span
          className="text-[11.5px] flex-shrink-0 ml-1.5"
          style={{ color: '#888780', fontFamily: 'JetBrains Mono, monospace' }}
        >
          {unit}
        </span>
      </div>
    </label>
  )
}
