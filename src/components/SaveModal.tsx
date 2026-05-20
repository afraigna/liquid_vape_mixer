import { useState, useEffect, useRef } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: (nom: string) => Promise<void>
}

export default function SaveModal({ isOpen, onClose, onConfirm }: Props) {
  const [nom, setNom] = useState('')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      const def = `Recette — ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}`
      setNom(def)
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 60)
    }
  }, [isOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const handleConfirm = async () => {
    setSaving(true)
    try {
      await onConfirm(nom.trim() || 'Recette sans nom')
      onClose()
    } catch (_) {
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-6"
      style={{ background: 'rgba(28,28,26,.42)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full bg-white rounded-[14px] animate-pop overflow-hidden"
        style={{
          maxWidth: 400,
          border: '0.5px solid #D3D1C7',
          boxShadow: '0 24px 60px -12px rgba(0,0,0,.25)',
        }}
      >
        <div className="flex items-center justify-between px-4.5 py-4" style={{ borderBottom: '0.5px solid #E8E6DE' }}>
          <div className="text-[14px] font-semibold" style={{ color: '#2C2C2A' }}>Enregistrer la recette</div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-[7px] flex items-center justify-center cursor-pointer"
            style={{ border: 'none', background: 'transparent', color: '#888780' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#F1EFE7')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            aria-label="Fermer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="p-4">
          <label className="block text-[11.5px] font-medium mb-1.5" style={{ color: '#56554F' }}>
            Nom de la recette
          </label>
          <input
            ref={inputRef}
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !saving && handleConfirm()}
            className="w-full h-9 px-3 rounded-lg text-[13px] outline-none"
            style={{ border: '0.5px solid #D3D1C7', background: '#fff', color: '#2C2C2A' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#185FA5')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#D3D1C7')}
          />
        </div>

        <div
          className="flex justify-end gap-2 px-4.5 py-3"
          style={{ borderTop: '0.5px solid #E8E6DE', background: '#FCFBF8' }}
        >
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg text-[12.5px] font-semibold cursor-pointer transition-colors"
            style={{ background: '#fff', border: '0.5px solid #D3D1C7', color: '#2C2C2A' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#FAF9F5')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving}
            className="h-9 px-4 rounded-lg text-[12.5px] font-semibold cursor-pointer transition-colors"
            style={{ background: '#2C2C2A', border: '0.5px solid #2C2C2A', color: '#fff', opacity: saving ? 0.6 : 1 }}
            onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = '#1A1A18' }}
            onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = '#2C2C2A' }}
          >
            {saving ? 'Enregistrement…' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  )
}
