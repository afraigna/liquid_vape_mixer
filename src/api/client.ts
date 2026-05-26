/**
 * Couche de persistance.
 *
 * aromes.json  → catalogue officiel (lecture seule)
 * lvm_user_entries → entrées utilisateur avec deux sous-types :
 *   • override  : refer_to_id != null  → surcharge d'un arôme du catalogue
 *   • standalone: refer_to_id == null  → arôme perso sans équivalent catalogue
 *
 * L'arôme retourné garde toujours l'ID du catalogue pour les overrides
 * (l'identité de l'arôme ne change pas quand on le personnalise).
 */

import { Arome, CreateAromePayload, SaveRecettePayload } from '../types'

const USER_ENTRIES_KEY = 'lvm_user_entries'
const RECETTES_KEY = 'lvm_recettes'

// Clés legacy pour migration one-shot
const LEGACY_OLD_KEY    = 'lvm_aromes'
const LEGACY_USER_KEY   = 'lvm_aromes_user'
const LEGACY_DOSAGES_KEY = 'lvm_dosages'

// ---------------------------------------------------------------------------
// Types internes
// ---------------------------------------------------------------------------

interface UserEntry {
  local_id: number          // identifiant local unique
  refer_to_id: number | null // non-null → override d'un arôme catalogue
  nom: string
  image_url: string | null
  dosage_conseille: number
  dosage_custom: number | null
  couleur: string
  product_url: string | null
  description: string | null
}

type CatalogArome = Omit<Arome, 'dosage_custom'>

// ---------------------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------------------

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

function getEntries(): UserEntry[] {
  return readJson<UserEntry[]>(USER_ENTRIES_KEY, [])
}

function nextLocalId(entries: UserEntry[]): number {
  const base = entries.reduce((max, e) => Math.max(max, e.local_id), 9999)
  return base + 1
}

function entryToArome(e: UserEntry, id: number): Arome {
  return {
    id,
    nom: e.nom,
    image_url: e.image_url,
    dosage_conseille: e.dosage_conseille,
    dosage_custom: e.dosage_custom,
    couleur: e.couleur,
    product_url: e.product_url,
    description: e.description,
  }
}

// ---------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------

async function fetchCatalog(): Promise<CatalogArome[]> {
  try {
    const res = await fetch(import.meta.env.BASE_URL + 'data/aromes.json')
    if (!res.ok) return []
    return (await res.json()) as CatalogArome[]
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// Migration one-shot des anciens formats localStorage
// ---------------------------------------------------------------------------

function migrateLegacy(): void {
  const hasNew   = localStorage.getItem(USER_ENTRIES_KEY) != null
  const hasOld1  = localStorage.getItem(LEGACY_OLD_KEY)   != null
  const hasOld2  = localStorage.getItem(LEGACY_USER_KEY)  != null

  if (hasNew || (!hasOld1 && !hasOld2)) return

  const entries: UserEntry[] = []
  let nextId = 10001

  // Format lvm_aromes (tout-en-un original)
  type OldArome = Arome & { dosage_custom: number | null }
  for (const a of readJson<OldArome[]>(LEGACY_OLD_KEY, [])) {
    entries.push({
      local_id: nextId++,
      refer_to_id: null,
      nom: a.nom, image_url: a.image_url, dosage_conseille: a.dosage_conseille,
      dosage_custom: a.dosage_custom ?? null, couleur: a.couleur,
      product_url: null, description: null,
    })
  }

  // Format lvm_aromes_user + lvm_dosages
  type PartialEntry = Omit<UserEntry, 'local_id' | 'refer_to_id'> & { id: number }
  const dosages = readJson<Record<number, number>>(LEGACY_DOSAGES_KEY, {})
  for (const a of readJson<PartialEntry[]>(LEGACY_USER_KEY, [])) {
    entries.push({
      local_id: nextId++,
      refer_to_id: null,
      nom: a.nom, image_url: a.image_url, dosage_conseille: a.dosage_conseille,
      dosage_custom: dosages[a.id] ?? null, couleur: a.couleur,
      product_url: a.product_url ?? null, description: a.description ?? null,
    })
  }

  if (entries.length > 0) writeJson(USER_ENTRIES_KEY, entries)
  localStorage.removeItem(LEGACY_OLD_KEY)
  localStorage.removeItem(LEGACY_USER_KEY)
  localStorage.removeItem(LEGACY_DOSAGES_KEY)
}

// ---------------------------------------------------------------------------
// API publique — lecture
// ---------------------------------------------------------------------------

export async function fetchAromes(): Promise<{ aromes: Arome[], catalogIds: Set<number> }> {
  migrateLegacy()

  const catalog = await fetchCatalog()
  const catalogIds = new Set(catalog.map((c) => c.id))
  const entries = getEntries()

  // Séparer overrides et standalone
  const overrides = new Map<number, UserEntry>()
  const standalones: UserEntry[] = []
  for (const e of entries) {
    if (e.refer_to_id != null) overrides.set(e.refer_to_id, e)
    else standalones.push(e)
  }

  // Fusionner catalogue + overrides (l'ID catalogue est conservé)
  const aromes: Arome[] = catalog.map((c) => {
    const ov = overrides.get(c.id)
    return ov ? entryToArome(ov, c.id) : { ...c, dosage_custom: null }
  })

  // Ajouter les standalone
  for (const e of standalones) {
    aromes.push(entryToArome(e, e.local_id))
  }

  return { aromes, catalogIds }
}

// ---------------------------------------------------------------------------
// API publique — écriture
// ---------------------------------------------------------------------------

/** Crée un arôme perso standalone (pas dans le catalogue). */
export async function createArome(payload: CreateAromePayload): Promise<Arome> {
  const entries = getEntries()
  const local_id = nextLocalId(entries)
  const newEntry: UserEntry = {
    local_id, refer_to_id: null,
    nom: payload.nom.trim(),
    image_url: payload.image_url ?? null,
    dosage_conseille: payload.dosage_conseille,
    dosage_custom: payload.dosage_custom ?? null,
    couleur: payload.couleur ?? '#888780',
    product_url: payload.product_url ?? null,
    description: payload.description ?? null,
  }
  writeJson(USER_ENTRIES_KEY, [...entries, newEntry])
  return entryToArome(newEntry, local_id)
}

/**
 * Crée ou met à jour une personnalisation d'arôme.
 * - isCatalog = true  → override catalogue  (refer_to_id = aromeId, ID retourné = aromeId)
 * - isCatalog = false → arôme standalone   (local_id = aromeId)
 */
export function upsertEdit(aromeId: number, payload: CreateAromePayload, isCatalog: boolean): Arome {
  const entries = getEntries()
  const data: Omit<UserEntry, 'local_id' | 'refer_to_id'> = {
    nom: payload.nom.trim(),
    image_url: payload.image_url ?? null,
    dosage_conseille: payload.dosage_conseille,
    dosage_custom: payload.dosage_custom ?? null,
    couleur: payload.couleur ?? '#888780',
    product_url: payload.product_url ?? null,
    description: payload.description ?? null,
  }

  if (isCatalog) {
    const existing = entries.find((e) => e.refer_to_id === aromeId)
    if (existing) {
      writeJson(USER_ENTRIES_KEY, entries.map((e) =>
        e.local_id === existing.local_id ? { ...existing, ...data } : e,
      ))
    } else {
      writeJson(USER_ENTRIES_KEY, [
        ...entries,
        { local_id: nextLocalId(entries), refer_to_id: aromeId, ...data },
      ])
    }
    return entryToArome({ local_id: aromeId, refer_to_id: aromeId, ...data }, aromeId)
  } else {
    writeJson(USER_ENTRIES_KEY, entries.map((e) =>
      e.local_id === aromeId ? { ...e, ...data } : e,
    ))
    return entryToArome({ local_id: aromeId, refer_to_id: null, ...data }, aromeId)
  }
}

/** Enregistre une recette dans l'historique. */
export async function saveRecette(payload: SaveRecettePayload): Promise<{ id: number }> {
  const recettes = readJson<Array<SaveRecettePayload & { id: number }>>(RECETTES_KEY, [])
  const id = recettes.length > 0 ? Math.max(...recettes.map((r) => r.id)) + 1 : 1
  writeJson(RECETTES_KEY, [...recettes, { id, ...payload }])
  return { id }
}
