import { Arome, CreateAromePayload, SaveRecettePayload } from '../types'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export async function fetchAromes(): Promise<Arome[]> {
  return request<Arome[]>('/api/aromes')
}

export async function createArome(payload: CreateAromePayload): Promise<Arome> {
  return request<Arome>('/api/aromes', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function saveRecette(payload: SaveRecettePayload): Promise<{ id: number }> {
  return request<{ id: number }>('/api/recettes', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
