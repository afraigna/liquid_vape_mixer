/**
 * Couche de persistance localStorage — remplace l'API Express+SQLite.
 * Les données sont stockées dans le navigateur de l'utilisateur.
 * Interface identique à l'ancienne version HTTP : aucun autre fichier à modifier.
 */
import { Arome, CreateAromePayload, SaveRecettePayload } from '../types'

const AROMES_KEY = 'lvm_aromes'
const RECETTES_KEY = 'lvm_recettes'

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function nextId(items: { id: number }[]): number {
  return items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1
}

export async function fetchAromes(): Promise<Arome[]> {
  return readJson<Arome[]>(AROMES_KEY, [])
}

export async function createArome(payload: CreateAromePayload): Promise<Arome> {
  const aromes = readJson<Arome[]>(AROMES_KEY, [])
  const newArome: Arome = {
    id: nextId(aromes),
    nom: payload.nom.trim(),
    image_url: payload.image_url ?? null,
    dosage_conseille: payload.dosage_conseille,
    dosage_custom: payload.dosage_custom ?? null,
    couleur: payload.couleur ?? '#888780',
  }
  writeJson(AROMES_KEY, [...aromes, newArome])
  return newArome
}

export async function saveRecette(payload: SaveRecettePayload): Promise<{ id: number }> {
  const recettes = readJson<Array<SaveRecettePayload & { id: number }>>(RECETTES_KEY, [])
  const id = nextId(recettes)
  writeJson(RECETTES_KEY, [...recettes, { id, ...payload }])
  return { id }
}
