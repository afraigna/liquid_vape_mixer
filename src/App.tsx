import { useState, useMemo, useCallback, useRef } from 'react'
import { MixParams, AromeMix, DoseMode, Arome } from './types'
import { calculate } from './utils/calculator'
import { saveRecette } from './api/client'
import { useAromes } from './hooks/useAromes'
import TopBar from './components/TopBar'
import MixParamsSection from './components/MixParams'
import AromesSection from './components/AromesSection'
import RecipeSummary from './components/RecipeSummary'
import AromeModal from './components/AromeModal'
import HistoryModal from './components/HistoryModal'
import SaveModal from './components/SaveModal'
import Toast from './components/Toast'

const DEFAULT_PARAMS: MixParams = {
  volumeTotal: 100,
  nicotineCible: 6,
  boosterNicotine: 20,
  ratioPG: 50,
}

export interface ToastState {
  message: string
  visible: boolean
}

const LS_KEY = 'liquide-history-v1'

export default function App() {
  const [params, setParams] = useState<MixParams>(DEFAULT_PARAMS)
  const [aromeMixes, setAromeMixes] = useState<AromeMix[]>([])
  const [doseMode, setDoseMode] = useState<DoseMode>('rec')
  const [aromeModalOpen, setAromeModalOpen] = useState(false)
  const [histModalOpen, setHistModalOpen] = useState(false)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [toast, setToast] = useState<ToastState>({ message: '', visible: false })
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { aromes, loading, create } = useAromes()

  const result = useMemo(
    () => calculate(params, aromeMixes, doseMode),
    [params, aromeMixes, doseMode],
  )

  const showToast = useCallback((msg: string) => {
    setToast({ message: msg, visible: true })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => {
      setToast({ message: msg, visible: false })
    }, 2000)
  }, [])

  const handleAddArome = useCallback(
    (arome: Arome) => {
      setAromeMixes((prev) => {
        if (prev.some((m) => m.arome.id === arome.id)) return prev
        const n = prev.length + 1
        const eq = Math.round(100 / n)
        if (prev.length === 0) return [{ arome, share: 100 }]
        const updated = prev.map((m) => ({ ...m, share: eq }))
        updated.push({ arome, share: 100 - eq * prev.length })
        return updated
      })
    },
    [],
  )

  const handleRemoveArome = useCallback((id: number) => {
    setAromeMixes((prev) => {
      const next = prev.filter((m) => m.arome.id !== id)
      if (next.length === 0) return next
      const total = next.reduce((s, m) => s + m.share, 0)
      if (Math.abs(total - 100) < 0.1) return next
      const factor = 100 / total
      return next.map((m) => ({ ...m, share: Math.round(m.share * factor * 10) / 10 }))
    })
  }, [])

  const handleSharesChange = useCallback((shares: number[]) => {
    setAromeMixes((prev) =>
      prev.map((m, i) => ({ ...m, share: shares[i] ?? m.share })),
    )
  }, [])

  const handleUpdateArome = useCallback((updated: Arome) => {
    setAromeMixes((prev) =>
      prev.map((m) => (m.arome.id === updated.id ? { ...m, arome: updated } : m)),
    )
  }, [])

  const handleCopy = useCallback(async () => {
    const lines = [
      `Recette e-liquide — ${new Date().toLocaleDateString('fr-FR')}`,
      `Volume : ${params.volumeTotal} ml | Nicotine : ${params.nicotineCible} mg/ml | Ratio : PG${params.ratioPG}/VG${100 - params.ratioPG}`,
      '',
      `Base PG   : ${result.volumePG.toFixed(1)} ml`,
      `Base VG   : ${result.volumeVG.toFixed(1)} ml`,
      `Nicotine  : ${result.volumeNicotine.toFixed(1)} ml`,
      ...result.volumeParArome.map(
        (a) => `${a.arome.nom.padEnd(9)}: ${a.volume.toFixed(1)} ml`,
      ),
      `Total     : ${params.volumeTotal.toFixed(1)} ml`,
    ]
    const text = lines.join('\n')
    try {
      await navigator.clipboard.writeText(text)
    } catch (_) {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    showToast('Recette copiée !')
  }, [params, result, showToast])

  const handleSave = useCallback(
    async (nom: string) => {
      try {
        await saveRecette({
          nom,
          params,
          aromes: result.volumeParArome.map((a) => ({
            arome_id: a.arome.id,
            dosage_custom: a.arome.dosage_custom,
            share: a.share,
            volume_calcule: a.volume,
          })),
          result: {
            volume_nicotine: result.volumeNicotine,
            volume_aromes_total: result.volumeAromesTotal,
            volume_base: result.volumeBase,
            volume_pg: result.volumePG,
            volume_vg: result.volumeVG,
          },
          created_at: new Date().toISOString(),
        })
        const snap = {
          id: 'r' + Date.now().toString(36),
          nom,
          date: Date.now(),
          params,
          summary: {
            volumeTotal: params.volumeTotal,
            ratio: `PG${params.ratioPG}/VG${100 - params.ratioPG}`,
            nicotineCible: params.nicotineCible,
            count: aromeMixes.length,
          },
          aromeMixes: aromeMixes.map((m) => ({ ...m })),
        }
        try {
          const hist = JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') as unknown[]
          localStorage.setItem(LS_KEY, JSON.stringify([snap, ...hist].slice(0, 50)))
        } catch (_) {}
        showToast(`« ${nom} » enregistrée`)
      } catch (e) {
        showToast('Erreur lors de la sauvegarde')
        throw e
      }
    },
    [params, result, aromeMixes, showToast],
  )

  const handleLoadRecipe = useCallback(
    (snap: { params: MixParams; aromeMixes: AromeMix[] }) => {
      setParams(snap.params)
      setAromeMixes(snap.aromeMixes)
      setHistModalOpen(false)
      showToast('Recette chargée')
    },
    [showToast],
  )

  return (
    <div
      className="max-w-[720px] mx-auto px-6 py-6"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <TopBar
        onOpenHistory={() => setHistModalOpen(true)}
      />

      <MixParamsSection params={params} onChange={setParams} />

      <AromesSection
        aromeMixes={aromeMixes}
        doseMode={doseMode}
        result={result}
        onDoseModeChange={setDoseMode}
        onSharesChange={handleSharesChange}
        onRemoveArome={handleRemoveArome}
        onOpenModal={() => setAromeModalOpen(true)}
        onUpdateArome={handleUpdateArome}
      />

      <RecipeSummary
        result={result}
        params={params}
        aromeMixes={aromeMixes}
        onCopy={handleCopy}
        onSave={() => setSaveModalOpen(true)}
      />

      <AromeModal
        isOpen={aromeModalOpen}
        libraryAromes={aromes}
        libraryLoading={loading}
        currentMixIds={aromeMixes.map((m) => m.arome.id)}
        onClose={() => setAromeModalOpen(false)}
        onAdd={handleAddArome}
        onCreate={create}
      />

      <HistoryModal
        isOpen={histModalOpen}
        onClose={() => setHistModalOpen(false)}
        onLoad={handleLoadRecipe}
      />

      <SaveModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        onConfirm={handleSave}
      />

      <Toast message={toast.message} visible={toast.visible} />
    </div>
  )
}
