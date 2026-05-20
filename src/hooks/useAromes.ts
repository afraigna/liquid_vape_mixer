import { useState, useEffect, useCallback } from 'react'
import { Arome, CreateAromePayload } from '../types'
import { fetchAromes, createArome } from '../api/client'

export function useAromes() {
  const [aromes, setAromes] = useState<Arome[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const data = await fetchAromes()
      setAromes(data)
    } catch (_) {
      setAromes([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const create = useCallback(
    async (payload: CreateAromePayload): Promise<Arome> => {
      const arome = await createArome(payload)
      setAromes((prev) => [...prev, arome])
      return arome
    },
    [],
  )

  return { aromes, loading, refresh, create }
}
