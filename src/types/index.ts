export interface Arome {
  id: number
  nom: string
  image_url: string | null
  dosage_conseille: number
  dosage_custom: number | null
  couleur: string
  product_url: string | null
  description: string | null
}

export interface AromeMix {
  arome: Arome
  share: number
}

export interface MixParams {
  volumeTotal: number
  nicotineCible: number
  boosterNicotine: number
  ratioPG: number
}

export interface AromeResult {
  arome: Arome
  volume: number
  dosageEffectif: number
  share: number
  pctDuLiquide: number
}

export interface MixResult {
  volumeNicotine: number
  volumeAromesTotal: number
  volumeBase: number
  volumePG: number
  volumeVG: number
  isValid: boolean
  volumeParArome: AromeResult[]
  totalDosePct: number
}

export interface CreateAromePayload {
  nom: string
  image_url: string | null
  dosage_conseille: number
  dosage_custom: number | null
  couleur: string
  product_url: string | null
  description: string | null
}

export type DoseMode = 'rec' | 'cust'

export type RatioPG = 30 | 50 | 70 | 80 | 100

export interface SaveRecettePayload {
  nom: string
  params: MixParams
  aromes: Array<{
    arome_id: number
    dosage_custom: number | null
    share: number
    volume_calcule: number
  }>
  result: {
    volume_nicotine: number
    volume_aromes_total: number
    volume_base: number
    volume_pg: number
    volume_vg: number
  }
  created_at: string
}
