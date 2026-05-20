import { MixParams, AromeMix, MixResult, DoseMode } from '../types'

const round = (x: number) => Math.round(x * 10) / 10

export function calculate(
  params: MixParams,
  mixes: AromeMix[],
  mode: DoseMode,
): MixResult {
  const V = Math.max(0, params.volumeTotal)
  const nicotineCible = Math.max(0, params.nicotineCible)
  const boosterNicotine = Math.max(0.0001, params.boosterNicotine)

  const volumeNicotine = round((V * nicotineCible) / boosterNicotine)

  const volumeParArome = mixes.map(({ arome, share }) => {
    const dosageEffectif =
      mode === 'cust'
        ? (arome.dosage_custom ?? arome.dosage_conseille)
        : arome.dosage_conseille
    const volume = round(V * (dosageEffectif / 100) * (share / 100))
    const pctDuLiquide = round((dosageEffectif / 100) * (share / 100) * 100)
    return { arome, volume, dosageEffectif, share, pctDuLiquide }
  })

  const volumeAromesTotal = round(
    volumeParArome.reduce((s, x) => s + x.volume, 0),
  )

  const volumeBase = round(V - volumeNicotine - volumeAromesTotal)
  const volumePG = round(volumeBase * (params.ratioPG / 100))
  const volumeVG = round(volumeBase * ((100 - params.ratioPG) / 100))

  const totalDosePct =
    V > 0 ? round((volumeAromesTotal / V) * 100) : 0

  return {
    volumeNicotine,
    volumeAromesTotal,
    volumeBase,
    volumePG,
    volumeVG,
    isValid: volumeBase >= -0.05,
    volumeParArome,
    totalDosePct,
  }
}

export function formatVol(n: number): string {
  return isFinite(n) ? n.toFixed(1) : '—'
}

export function fmt(n: number, d = 1): string {
  return isFinite(n) ? (Math.round(n * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d) : '—'
}
