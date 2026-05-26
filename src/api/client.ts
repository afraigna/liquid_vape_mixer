import { Arome, CreateAromePayload, SaveRecettePayload } from '../types'

const USER_AROMES_KEY = 'lvm_aromes_user'
const DOSAGES_KEY = 'lvm_dosages'
const RECETTES_KEY = 'lvm_recettes'
// Ancienne clé — conservée uniquement pour la migration one-shot
const LEGACY_AROMES_KEY = 'lvm_aromes'

type DosagesMap = Record<number, number>

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

type CatalogArome = Omit<Arome, 'dosage_custom'>

async function fetchCatalog(): Promise<CatalogArome[]> {
  try {
    const res = await fetch(import.meta.env.BASE_URL + 'data/aromes.json')
    if (!res.ok) return []
    return (await res.json()) as CatalogArome[]
  } catch {
    return []
  }
}

function migrateLegacy(catalogIds: Set<number>): void {
  const legacy = readJson<Array<Arome & { dosage_custom: number | null }>>(LEGACY_AROMES_KEY, [])
  if (legacy.length === 0) return

  const dosages = readJson<DosagesMap>(DOSAGES_KEY, {})
  const userAromes = readJson<CatalogArome[]>(USER_AROMES_KEY, [])
  const existingUserIds = new Set(userAromes.map((a) => a.id))

  for (const a of legacy) {
    if (a.dosage_custom != null) {
      dosages[a.id] = a.dosage_custom
    }
    // Les arômes absents du catalogue sont des arômes "user"
    if (!catalogIds.has(a.id) && !existingUserIds.has(a.id)) {
      userAromes.push({ id: a.id, nom: a.nom, image_url: a.image_url, dosage_conseille: a.dosage_conseille, couleur: a.couleur, product_url: null, description: null })
      existingUserIds.add(a.id)
    }
  }

  writeJson(DOSAGES_KEY, dosages)
  writeJson(USER_AROMES_KEY, userAromes)
  localStorage.removeItem(LEGACY_AROMES_KEY)
}

function applyDosages(aromes: CatalogArome[], dosages: DosagesMap): Arome[] {
  return aromes.map((a) => ({
    ...a,
    dosage_custom: dosages[a.id] ?? null,
  }))
}

export async function fetchAromes(): Promise<Arome[]> {
  const catalog = await fetchCatalog()
  const catalogIds = new Set(catalog.map((a) => a.id))

  migrateLegacy(catalogIds)

  const userAromes = readJson<CatalogArome[]>(USER_AROMES_KEY, [])
  const dosages = readJson<DosagesMap>(DOSAGES_KEY, {})

  const all = [...catalog, ...userAromes]
  return applyDosages(all, dosages)
}

export async function createArome(payload: CreateAromePayload): Promise<Arome> {
  const userAromes = readJson<CatalogArome[]>(USER_AROMES_KEY, [])
  // IDs utilisateur ≥ 10000 pour éviter les conflits avec le catalogue
  const newId = userAromes.length > 0
    ? Math.max(...userAromes.map((a) => a.id), 9999) + 1
    : 10000
  const newArome: CatalogArome = {
    id: newId,
    nom: payload.nom.trim(),
    image_url: payload.image_url ?? null,
    dosage_conseille: payload.dosage_conseille,
    couleur: payload.couleur ?? '#888780',
    product_url: payload.product_url ?? null,
    description: payload.description ?? null,
  }
  writeJson(USER_AROMES_KEY, [...userAromes, newArome])

  if (payload.dosage_custom != null) {
    const dosages = readJson<DosagesMap>(DOSAGES_KEY, {})
    writeJson(DOSAGES_KEY, { ...dosages, [newId]: payload.dosage_custom })
  }

  const dosages = readJson<DosagesMap>(DOSAGES_KEY, {})
  return { ...newArome, dosage_custom: dosages[newId] ?? null }
}

export function updateDosageCustom(id: number, dosage: number | null): void {
  const dosages = readJson<DosagesMap>(DOSAGES_KEY, {})
  if (dosage == null) {
    delete dosages[id]
  } else {
    dosages[id] = dosage
  }
  writeJson(DOSAGES_KEY, dosages)
}

export async function saveRecette(payload: SaveRecettePayload): Promise<{ id: number }> {
  const recettes = readJson<Array<SaveRecettePayload & { id: number }>>(RECETTES_KEY, [])
  const id = recettes.length > 0 ? Math.max(...recettes.map((r) => r.id)) + 1 : 1
  writeJson(RECETTES_KEY, [...recettes, { id, ...payload }])
  return { id }
}
