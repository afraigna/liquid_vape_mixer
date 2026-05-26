import { useState, useRef, useEffect } from 'react'
import { Arome, CreateAromePayload } from '../types'

const PALETTE = [
  '#378ADD', '#1D9E75', '#D4537E', '#BA7517', '#7F77DD', '#D85A30',
  '#3FA7A0', '#A5497F', '#E0B83C', '#7FA938', '#56554F', '#185FA5',
]

function normHex(s: string): string | null {
  let v = s.trim()
  if (!v) return null
  if (v[0] !== '#') v = '#' + v
  if (/^#[0-9a-f]{3}$/i.test(v)) v = '#' + v.slice(1).split('').map((c) => c + c).join('')
  return /^#[0-9a-f]{6}$/i.test(v) ? v.toUpperCase() : null
}

function BottleSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
      <rect x="9" y="2" width="6" height="3" rx="1" fill="#9B9A92"/>
      <path d="M8 6.5h8a1 1 0 0 1 1 1V9c0 .6.4 1.1.9 1.4 1.6 1 2.6 2.7 2.6 4.7V19a3 3 0 0 1-3 3H6.5a3 3 0 0 1-3-3v-3.9c0-2 1-3.7 2.6-4.7.5-.3.9-.8.9-1.4V7.5a1 1 0 0 1 1-1Z" fill={color} opacity="0.85"/>
      <rect x="6" y="13" width="12" height="6" rx="1.5" fill="#fff" opacity="0.18"/>
    </svg>
  )
}

interface Props {
  isOpen: boolean
  libraryAromes: Arome[]
  libraryLoading: boolean
  currentMixIds: number[]
  onClose: () => void
  onAdd: (arome: Arome) => void
  onCreate: (payload: CreateAromePayload) => Promise<Arome>
}

type View = 'library' | 'form'
type FormMode = 'create' | 'edit'

interface FormState {
  nom: string
  imageUrl: string
  dosageConseille: string
  dosageCustom: string
  couleur: string
  productUrl: string
  description: string
}

const DEFAULT_FORM: FormState = {
  nom: '',
  imageUrl: '',
  dosageConseille: '',
  dosageCustom: '',
  couleur: '#378ADD',
  productUrl: '',
  description: '',
}

export default function AromeModal({
  isOpen,
  libraryAromes,
  libraryLoading,
  currentMixIds,
  onClose,
  onAdd,
  onCreate,
}: Props) {
  const [view, setView] = useState<View>('library')
  const [formMode, _setFormMode] = useState<FormMode>('create')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [nameError, setNameError] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) {
      setView('library')
      setSearch('')
      setForm(DEFAULT_FORM)
      setNameError(false)
    } else {
      setTimeout(() => searchRef.current?.focus(), 60)
    }
  }, [isOpen])

  useEffect(() => {
    if (view === 'form') {
      setTimeout(() => nameRef.current?.focus(), 60)
    }
  }, [view])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const q = search.toLowerCase()
  const filtered = libraryAromes.filter((a) =>
    a.nom.toLowerCase().includes(q) ||
    (a.description ?? '').toLowerCase().includes(q),
  )

  const handleAdd = (arome: Arome) => {
    if (currentMixIds.includes(arome.id)) return
    onAdd(arome)
    onClose()
  }

  const setColor = (hex: string) => {
    const norm = normHex(hex) ?? form.couleur
    setForm((f) => ({ ...f, couleur: norm }))
  }

  const handleSave = async () => {
    if (!form.nom.trim()) {
      setNameError(true)
      nameRef.current?.focus()
      setTimeout(() => setNameError(false), 1500)
      return
    }
    setSaving(true)
    try {
      const rec = parseFloat(form.dosageConseille) || 0
      const custRaw = parseFloat(form.dosageCustom)
      const payload: CreateAromePayload = {
        nom: form.nom.trim(),
        image_url: form.imageUrl.trim() || null,
        dosage_conseille: rec,
        dosage_custom: isFinite(custRaw) ? custRaw : null,
        couleur: form.couleur,
        product_url: form.productUrl.trim() || null,
        description: form.description.trim() || null,
      }
      const created = await onCreate(payload)
      onAdd(created)
      onClose()
    } catch (_) {
      // error silently
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
        className="w-full bg-white rounded-[14px] flex flex-col animate-pop overflow-hidden"
        style={{
          maxWidth: view === 'form' ? 480 : 520,
          maxHeight: '84vh',
          border: '0.5px solid #D3D1C7',
          boxShadow: '0 24px 60px -12px rgba(0,0,0,.25)',
        }}
      >
        {view === 'library' ? (
          <LibraryView
            search={search}
            searchRef={searchRef}
            filtered={filtered}
            loading={libraryLoading}
            currentMixIds={currentMixIds}
            onSearchChange={setSearch}
            onAdd={handleAdd}
            onClose={onClose}
            onNewArome={() => { setForm(DEFAULT_FORM); setView('form') }}
          />
        ) : (
          <FormView
            form={form}
            formMode={formMode}
            nameRef={nameRef}
            nameError={nameError}
            saving={saving}
            onChange={(partial) => setForm((f) => ({ ...f, ...partial }))}
            onSetColor={setColor}
            onBack={() => setView('library')}
            onClose={onClose}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  )
}

function LibraryView({
  search, searchRef, filtered, loading, currentMixIds,
  onSearchChange, onAdd, onClose, onNewArome,
}: {
  search: string
  searchRef: React.RefObject<HTMLInputElement | null>
  filtered: Arome[]
  loading: boolean
  currentMixIds: number[]
  onSearchChange: (s: string) => void
  onAdd: (a: Arome) => void
  onClose: () => void
  onNewArome: () => void
}) {
  return (
    <>
      <div className="flex items-center justify-between px-4.5 py-4" style={{ borderBottom: '0.5px solid #E8E6DE' }}>
        <div>
          <div className="text-[14px] font-semibold" style={{ color: '#2C2C2A' }}>Bibliothèque d'arômes</div>
          <div className="text-[11.5px] mt-0.5" style={{ color: '#888780' }}>Sélectionnez un arôme à ajouter</div>
        </div>
        <XBtn onClick={onClose} />
      </div>

      <div className="p-4 overflow-y-auto flex-1">
        <div
          className="flex items-center gap-2 h-9 px-3 mb-3 rounded-[9px]"
          style={{ border: '0.5px solid #D3D1C7', background: '#fff' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888780" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher un arôme…"
            className="flex-1 border-0 outline-none bg-transparent text-[13px]"
            style={{ color: '#2C2C2A' }}
          />
        </div>

        {loading ? (
          <div className="py-4 text-center text-[12px]" style={{ color: '#888780' }}>Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="py-4 text-center text-[12px]" style={{ color: '#888780' }}>
            {search ? 'Aucun arôme trouvé.' : 'Aucun arôme dans la bibliothèque.'}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {filtered.map((arome) => {
              const added = currentMixIds.includes(arome.id)
              return (
                <div
                  key={arome.id}
                  className="grid items-center rounded-[9px] px-2.5 py-2"
                  style={{
                    gridTemplateColumns: '36px 1fr auto',
                    gap: 12,
                    border: '0.5px solid #E8E6DE',
                    background: '#fff',
                    opacity: added ? 0.5 : 1,
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
                    style={{ background: '#F4F2EC', border: '0.5px solid #E8E6DE' }}
                  >
                    {arome.image_url ? (
                      <img src={arome.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <BottleSVG color={arome.couleur} />
                    )}
                  </div>
                  <div>
                    <div className="text-[13px] font-medium" style={{ color: '#2C2C2A' }}>{arome.nom}</div>
                    {arome.description && (
                      <div className="text-[11px]" style={{ color: '#56554F' }}>{arome.description}</div>
                    )}
                    <div className="text-[11px] mt-0.5" style={{ color: '#888780', fontFamily: 'JetBrains Mono, monospace' }}>
                      Conseil {arome.dosage_conseille.toFixed(1)}% · Perso {(arome.dosage_custom ?? arome.dosage_conseille).toFixed(1)}%
                    </div>
                  </div>
                  <button
                    onClick={() => onAdd(arome)}
                    disabled={added}
                    className="h-7 px-3 rounded-[7px] text-[12px] font-medium cursor-pointer transition-colors"
                    style={{
                      border: '0.5px solid #D3D1C7',
                      background: added ? '#F1EFE7' : '#fff',
                      color: added ? '#888780' : '#2C2C2A',
                      cursor: added ? 'default' : 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      if (!added) {
                        e.currentTarget.style.background = '#E6F1FB'
                        e.currentTarget.style.color = '#185FA5'
                        e.currentTarget.style.borderColor = '#185FA5'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!added) {
                        e.currentTarget.style.background = '#fff'
                        e.currentTarget.style.color = '#2C2C2A'
                        e.currentTarget.style.borderColor = '#D3D1C7'
                      }
                    }}
                  >
                    {added ? 'Ajouté' : '＋ Ajouter'}
                  </button>
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
        <button
          onClick={onNewArome}
          className="text-[12.5px] font-semibold cursor-pointer"
          style={{ background: 'transparent', border: 'none', color: '#185FA5', padding: 0 }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
        >
          ＋ Créer un nouvel arôme
        </button>
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
    </>
  )
}

function FormView({
  form, nameRef, nameError, saving,
  onChange, onSetColor, onBack, onClose, onSave,
}: {
  form: FormState
  formMode: FormMode
  nameRef: React.RefObject<HTMLInputElement | null>
  nameError: boolean
  saving: boolean
  onChange: (partial: Partial<FormState>) => void
  onSetColor: (hex: string) => void
  onBack: () => void
  onClose: () => void
  onSave: () => void
}) {
  const previewName = form.nom.trim() || 'Nouvel arôme'
  const previewRec = form.dosageConseille || '—'
  const previewCust = form.dosageCustom || previewRec

  return (
    <>
      <div className="flex items-center justify-between px-4.5 py-4" style={{ borderBottom: '0.5px solid #E8E6DE' }}>
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-medium cursor-pointer"
            style={{ background: 'transparent', border: 'none', color: '#56554F', padding: 0 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#2C2C2A')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#56554F')}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Bibliothèque
          </button>
          <div className="text-[14px] font-semibold mt-1" style={{ color: '#2C2C2A' }}>Nouvel arôme</div>
        </div>
        <XBtn onClick={onClose} />
      </div>

      <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3">
        {/* Nom */}
        <FormField label="Nom *">
          <input
            ref={nameRef}
            value={form.nom}
            onChange={(e) => onChange({ nom: e.target.value })}
            placeholder="ex. Custard vanille"
            autoComplete="off"
            className="w-full h-9 px-3 rounded-lg text-[13px] outline-none transition-shadow"
            style={{
              border: nameError ? '0.5px solid #BA4A1A' : '0.5px solid #D3D1C7',
              background: '#fff',
              color: '#2C2C2A',
            }}
            onFocus={(e) => { if (!nameError) e.currentTarget.style.borderColor = '#185FA5' }}
            onBlur={(e) => { if (!nameError) e.currentTarget.style.borderColor = '#D3D1C7' }}
          />
        </FormField>

        {/* Image URL */}
        <FormField label="Image (URL)">
          <input
            value={form.imageUrl}
            onChange={(e) => onChange({ imageUrl: e.target.value })}
            placeholder="https://…"
            type="url"
            autoComplete="off"
            className="w-full h-9 px-3 rounded-lg text-[13px] outline-none"
            style={{ border: '0.5px solid #D3D1C7', background: '#fff', color: '#2C2C2A' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#185FA5')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#D3D1C7')}
          />
        </FormField>

        {/* Lien produit */}
        <FormField label="Lien produit (URL)">
          <input
            value={form.productUrl}
            onChange={(e) => onChange({ productUrl: e.target.value })}
            placeholder="https://…"
            type="url"
            autoComplete="off"
            className="w-full h-9 px-3 rounded-lg text-[13px] outline-none"
            style={{ border: '0.5px solid #D3D1C7', background: '#fff', color: '#2C2C2A' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#185FA5')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#D3D1C7')}
          />
        </FormField>

        {/* Description */}
        <FormField label="Description">
          <input
            value={form.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="ex. goût ananas mangue"
            autoComplete="off"
            className="w-full h-9 px-3 rounded-lg text-[13px] outline-none"
            style={{ border: '0.5px solid #D3D1C7', background: '#fff', color: '#2C2C2A' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#185FA5')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#D3D1C7')}
          />
        </FormField>

        {/* Dosages */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Dosage conseillé *">
            <NumInput
              value={form.dosageConseille}
              placeholder="8"
              onChange={(v) => onChange({ dosageConseille: v })}
            />
          </FormField>
          <FormField label="Dosage personnalisé">
            <NumInput
              value={form.dosageCustom}
              placeholder={form.dosageConseille || '8'}
              onChange={(v) => onChange({ dosageCustom: v })}
            />
          </FormField>
        </div>

        {/* Couleur */}
        <FormField label="Couleur">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-9 rounded-lg flex-shrink-0 relative overflow-hidden cursor-pointer"
              style={{ border: '0.5px solid #D3D1C7', background: form.couleur, boxShadow: 'inset 0 0 0 .5px rgba(0,0,0,.06)' }}
            >
              <input
                type="color"
                value={form.couleur}
                onChange={(e) => onSetColor(e.target.value)}
                className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)] border-0 p-0 cursor-pointer"
                style={{ background: 'transparent', opacity: 0 }}
                aria-label="Sélecteur de couleur"
              />
            </div>
            <div
              className="flex items-center flex-1 h-9 px-3 rounded-lg"
              style={{ border: '0.5px solid #D3D1C7', background: '#fff' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#185FA5')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#D3D1C7')}
            >
              <span className="text-[13px] mr-0.5" style={{ color: '#888780', fontFamily: 'JetBrains Mono, monospace' }}>#</span>
              <input
                type="text"
                maxLength={6}
                value={form.couleur.slice(1).toUpperCase()}
                onChange={(e) => onSetColor('#' + e.target.value)}
                onBlur={(e) => onSetColor('#' + e.target.value)}
                placeholder="378ADD"
                spellCheck={false}
                className="flex-1 border-0 outline-none bg-transparent text-[13px] font-medium uppercase tracking-wider"
                style={{ color: '#2C2C2A', fontFamily: 'JetBrains Mono, monospace' }}
              />
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap mt-2">
            {PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => onSetColor(c)}
                style={{
                  width: 22, height: 22, borderRadius: 6, background: c,
                  border: form.couleur.toUpperCase() === c.toUpperCase()
                    ? '2px solid #2C2C2A'
                    : '0.5px solid rgba(0,0,0,.08)',
                  cursor: 'pointer', padding: 0,
                  boxShadow: form.couleur.toUpperCase() === c.toUpperCase()
                    ? '0 0 0 1.5px #fff inset'
                    : 'none',
                }}
              />
            ))}
          </div>
        </FormField>

        {/* Preview */}
        <div
          className="flex items-center gap-3 p-2.5 rounded-[9px]"
          style={{ border: '0.5px dashed #D3D1C7', background: '#FCFBF8' }}
        >
          <div
            className="w-11 h-11 rounded-[9px] flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{ background: '#F4F2EC', border: '0.5px solid #E8E6DE' }}
          >
            {form.imageUrl ? (
              <img src={form.imageUrl} alt="" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
            ) : (
              <BottleSVG color={form.couleur} />
            )}
          </div>
          <div>
            <div className="text-[13px] font-medium" style={{ color: '#2C2C2A' }}>{previewName}</div>
            <div className="text-[11px] mt-0.5" style={{ color: '#888780', fontFamily: 'JetBrains Mono, monospace' }}>
              conseil {previewRec === '—' ? '—' : previewRec + '%'} · perso {previewCust === '—' ? '—' : previewCust + '%'}
            </div>
          </div>
        </div>
      </div>

      <div
        className="flex items-center justify-between px-4.5 py-3"
        style={{ borderTop: '0.5px solid #E8E6DE', background: '#FCFBF8' }}
      >
        <span className="text-[11px]" style={{ color: '#888780' }}>Sera ajouté à la bibliothèque et à la recette.</span>
        <div className="flex gap-2">
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
            onClick={onSave}
            disabled={saving}
            className="h-9 px-4 rounded-lg text-[12.5px] font-semibold cursor-pointer transition-colors"
            style={{ background: '#2C2C2A', border: '0.5px solid #2C2C2A', color: '#fff', opacity: saving ? 0.6 : 1 }}
            onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = '#1A1A18' }}
            onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = '#2C2C2A' }}
          >
            {saving ? 'Création…' : 'Créer et ajouter'}
          </button>
        </div>
      </div>
    </>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11.5px] font-medium mb-1.5" style={{ color: '#56554F' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function NumInput({ value, placeholder, onChange }: { value: string; placeholder: string; onChange: (v: string) => void }) {
  return (
    <div
      className="flex items-center h-9 px-3 rounded-lg"
      style={{ border: '0.5px solid #D3D1C7', background: '#fff' }}
      onFocus={(e) => (e.currentTarget.style.borderColor = '#185FA5')}
      onBlur={(e) => (e.currentTarget.style.borderColor = '#D3D1C7')}
    >
      <input
        type="number"
        min={0}
        step={0.5}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => e.target.select()}
        className="flex-1 border-0 outline-none bg-transparent text-[13px] font-medium"
        style={{ color: '#2C2C2A' }}
      />
      <span className="text-[11px] ml-1" style={{ color: '#888780', fontFamily: 'JetBrains Mono, monospace' }}>%</span>
    </div>
  )
}

function XBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-7 h-7 rounded-[7px] flex items-center justify-center cursor-pointer transition-colors"
      style={{ border: 'none', background: 'transparent', color: '#888780' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#F1EFE7'; e.currentTarget.style.color = '#2C2C2A' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888780' }}
      aria-label="Fermer"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18M6 6l12 12"/>
      </svg>
    </button>
  )
}
