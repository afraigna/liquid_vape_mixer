import { useRef, useCallback } from 'react'

interface Props {
  shares: number[]
  colors: string[]
  onChange: (shares: number[]) => void
}

const MIN_SHARE = 1

const round = (x: number) => Math.round(x * 10) / 10

function getCutPoints(shares: number[]): number[] {
  const cuts: number[] = []
  let acc = 0
  for (let i = 0; i < shares.length - 1; i++) {
    acc += shares[i]
    cuts.push(acc)
  }
  return cuts
}

function updateShares(shares: number[], j: number, newPos: number): number[] {
  const cuts = getCutPoints(shares)
  const lo = j === 0 ? MIN_SHARE : cuts[j - 1] + MIN_SHARE
  const hi = j === shares.length - 2 ? 100 - MIN_SHARE : cuts[j + 1] - MIN_SHARE
  const clamped = Math.max(lo, Math.min(hi, newPos))
  const delta = clamped - cuts[j]
  const next = [...shares]
  next[j] = round(next[j] + delta)
  next[j + 1] = round(next[j + 1] - delta)
  const drift = round(100 - next.reduce((a, b) => a + b, 0))
  next[next.length - 1] = round(next[next.length - 1] + drift)
  return next
}

export default function MultiSlider({ shares, colors, onChange }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef<number | null>(null)

  const handlePointerMove = useCallback(
    (e: PointerEvent, j: number) => {
      if (draggingRef.current !== j) return
      const track = trackRef.current
      if (!track) return
      const rect = track.getBoundingClientRect()
      const rawPct = ((e.clientX - rect.left) / rect.width) * 100
      onChange(updateShares(shares, j, rawPct))
    },
    [shares, onChange],
  )

  if (shares.length <= 1) return null

  const cuts = getCutPoints(shares)

  return (
    <div className="px-0 pb-1 pt-3">
      <div
        ref={trackRef}
        className="slider-track"
        style={{ height: 12, borderRadius: 6 }}
      >
        {/* Segments colorés */}
        <div className="absolute inset-0 flex rounded-[6px] overflow-hidden" style={{ border: '0.5px solid rgba(0,0,0,0.08)' }}>
          {shares.map((share, i) => (
            <div
              key={i}
              style={{
                flex: `${share} 0 0`,
                background: colors[i] ?? '#888780',
                opacity: 0.85,
              }}
            />
          ))}
        </div>

        {/* Thumbs */}
        {cuts.map((cut, j) => (
          <div
            key={j}
            className="slider-thumb"
            style={{ left: `${cut}%` }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId)
              draggingRef.current = j
              e.currentTarget.classList.add('dragging')

              const onMove = (ev: PointerEvent) => handlePointerMove(ev, j)
              const onUp = () => {
                draggingRef.current = null
                e.currentTarget.classList.remove('dragging')
                window.removeEventListener('pointermove', onMove)
                window.removeEventListener('pointerup', onUp)
              }
              window.addEventListener('pointermove', onMove)
              window.addEventListener('pointerup', onUp)
            }}
          >
            <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
              <line x1="2" y1="2" x2="2" y2="8" stroke="#888780" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="4" y1="2" x2="4" y2="8" stroke="#888780" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
        ))}
      </div>

      {/* Labels des parts sous le slider */}
      <div className="flex mt-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        {shares.map((share, i) => (
          <div
            key={i}
            className="text-center text-[10.5px] font-medium"
            style={{
              flex: `${share} 0 0`,
              color: colors[i] ?? '#888780',
              overflow: 'hidden',
            }}
          >
            {share.toFixed(0)}%
          </div>
        ))}
      </div>
    </div>
  )
}
