import { useState, useEffect, useCallback } from 'react'
import { Arome, CreateAromePayload } from '../types'
import { fetchAromes, createArome, upsertEdit } from '../api/client'

export function useAromes() {
  const [aromes, setAromes] = useState<Arome[]>([])
  const [catalogIds, setCatalogIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const { aromes: data, catalogIds: catIds } = await fetchAromes()
      setAromes(data)
      setCatalogIds(catIds)
    } catch (_) {
      setAromes([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const create = useCallback(async (payload: CreateAromePayload): Promise<Arome> => {
    const arome = await createArome(payload)
    setAromes((prev) => [...prev, arome])
    return arome
  }, [])

  /**
   * Crée ou met à jour une personnalisation.
   * isCatalog = true  → override du catalogue (l'ID reste le catalog ID)
   * isCatalog = false → édition d'un arôme perso standalone
   */
  const edit = useCallback((aromeId: number, payload: CreateAromePayload, isCatalog: boolean): Arome => {
    const updated = upsertEdit(aromeId, payload, isCatalog)
    setAromes((prev) => prev.map((a) => (a.id === aromeId ? updated : a)))
    return updated
  }, [])

  return { aromes, catalogIds, loading, refresh, create, edit }
}
