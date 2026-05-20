import { useState, useEffect } from 'react'
import { MixParams, AromeMix } from '../types'

const LS_KEY = 'liquide-history-v1'

interface HistSnap {
  id: string
  nom: string
  date: number
  params: MixParams
  aromeMixes: AromeMix[]
  summary: {
    volumeTotal: number
    ratio: string
    nicotineCible: number
    count: number
  }
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onLoad: (snap: { params: MixParams; aromeMixes: AromeMix[] }) => void
}

export default function HistoryModal({ isOpen, onClose, onLoad }: Props) {
  const [history, setHistory] = useState<HistSnap[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (isOpen) {
      setSearch('')
      try {
        const raw = localStorage.getItem(LS_KEY)
        setHistory(raw ? (JSON.parse(raw) as HistSnap[]) : [])
      } catch (_) {
        setHistory([])
      }
    }
  }, [isOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const handleDelete = (id: string) => {
    const next = history.filter((h) => h.id !== id)
    setHistory(next)
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(next))
    } catch (_) {}
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-6"
      style={{ background: 'rgba(28,28,26,.42)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full bg-white rounded-[14px] flex flex-col animate-pop overflow-hidden"
        style={{
          maxWidth: 520,
          maxHeight: '84vh',
          border: '0.5px solid #D3D1C7',
          boxShadow: '0 24px 60px -12px rgba(0,0,0,.25)',
        }}
      >
        <div className="flex items-center justify-between px-4.5 py-4" style={{ borderBottom: '0.5px solid #E8E6DE' }}>
          <div>
            <div className="text-[14px] font-semibold" style={{ color: '#2C2C2A' }}>Mes recettes</div>
            <div className="text-[11.5px] mt-0.5" style={{ color: '#888780' }}>
              {history.length
                ? `${history.length} recette${history.length > 1 ? 's' : ''} enregistrée${history.length > 1 ? 's' : ''}`
                : 'Aucune recette enregistrée'}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-[7px] flex items-center justify-center cursor-pointer"
            style={{ border: 'none', background: 'transparent', color: '#888780' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F1EFE7'; e.currentTarget.style.color = '#2C2C2A' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888780' }}
            aria-label="Fermer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {/* Barre de recherche */}
          {history.length > 0 && (
            <div
              className="flex items-center gap-2 h-9 px-3 mb-3 rounded-[9px]"
              style={{ border: '0.5px solid #D3D1C7', background: '#fff' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888780" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une recette…"
                className="flex-1 border-0 outline-none bg-transparent text-[13px]"
                style={{ color: '#2C2C2A' }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{ border: 'none', background: 'transparent', color: '#888780', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                  aria-label="Effacer"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </div>
          )}

          {history.length === 0 ? (
            <div className="py-6 text-center text-[12px]" style={{ color: '#888780' }}>
              Aucune recette enregistrée.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {history.filter((snap) =>
                snap.nom.toLowerCase().includes(search.toLowerCase())
              ).length === 0 ? (
                <div className="py-6 text-center text-[12px]" style={{ color: '#888780' }}>
                  Aucune recette ne correspond à « {search} ».
                </div>
              ) : null}
              {history.filter((snap) =>
                snap.nom.toLowerCase().includes(search.toLowerCase())
              ).map((snap) => {
                const d = new Date(snap.date)
                const date =
                  d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) +
                  ' · ' +
                  d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                const s = snap.summary
                return (
                  <div
                    key={snap.id}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-[9px]"
                    style={{ border: '0.5px solid #E8E6DE', background: '#fff' }}
                  >
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium truncate" style={{ color: '#2C2C2A' }}>{snap.nom}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: '#888780', fontFamily: 'JetBrains Mono, monospace' }}>
                        {s.volumeTotal}ml · {s.ratio} · {s.nicotineCible}mg · {s.count} arôme{s.count > 1 ? 's' : ''} · {date}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => onLoad({ params: snap.params, aromeMixes: snap.aromeMixes })}
                        className="h-7 px-3 rounded-[7px] text-[12px] font-medium cursor-pointer transition-colors"
                        style={{ border: '0.5px solid #D3D1C7', background: '#fff', color: '#2C2C2A' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#E6F1FB'; e.currentTarget.style.color = '#185FA5'; e.currentTarget.style.borderColor = '#185FA5' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#2C2C2A'; e.currentTarget.style.borderColor = '#D3D1C7' }}
                      >
                        Charger
                      </button>
                      <button
                        onClick={() => handleDelete(snap.id)}
                        className="w-7 h-7 rounded-[7px] flex items-center justify-center cursor-pointer transition-colors"
                        style={{ border: 'none', background: 'transparent', color: '#888780' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#FBEEE6'; e.currentTarget.style.color = '#BA4A1A' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888780' }}
                        aria-label="Supprimer"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>


        <div
          className="flex items-center justify-between px-4.5 py-3"
          style={{ borderTop: '0.5px solid #E8E6DE', background: '#FCFBF8' }}
        >
          <span className="text-[11px]" style={{ color: '#888780' }}>Sauvegardé localement sur cet appareil.</span>
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg text-[12.5px] font-semibold cursor-pointer transition-colors"
            style={{ background: '#fff', border: '0.5px solid #D3D1C7', color: '#2C2C2A' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#FAF9F5')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
