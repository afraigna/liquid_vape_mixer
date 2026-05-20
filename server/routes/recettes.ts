import { Router, Request, Response } from 'express'
import { db } from '../db.js'

const router = Router()

interface AromeEntry {
  arome_id: number
  dosage_custom: number | null
  share: number
  volume_calcule: number
}

interface SaveBody {
  nom: string
  params: {
    volumeTotal: number
    nicotineCible: number
    boosterNicotine: number
    ratioPG: number
  }
  aromes: AromeEntry[]
  result: {
    volume_nicotine: number
    volume_aromes_total: number
    volume_base: number
    volume_pg: number
    volume_vg: number
  }
}

router.post('/', (req: Request, res: Response) => {
  const body = req.body as SaveBody

  if (!body.nom || !body.params || !body.result) {
    res.status(400).json({ error: 'Payload incomplet' })
    return
  }

  const insertRecette = db.prepare(
    `INSERT INTO recettes (nom, volume_total, nicotine_cible, booster_nicotine, ratio_pg,
       volume_nicotine, volume_aromes_total, volume_base, volume_pg, volume_vg)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )

  const insertAromeRow = db.prepare(
    `INSERT INTO recette_aromes (recette_id, arome_id, dosage_custom, share, volume_calcule)
     VALUES (?, ?, ?, ?, ?)`,
  )

  const transaction = db.transaction((b: SaveBody) => {
    const r = insertRecette.run(
      b.nom,
      b.params.volumeTotal,
      b.params.nicotineCible,
      b.params.boosterNicotine,
      b.params.ratioPG,
      b.result.volume_nicotine,
      b.result.volume_aromes_total,
      b.result.volume_base,
      b.result.volume_pg,
      b.result.volume_vg,
    )
    const recetteId = r.lastInsertRowid
    for (const a of b.aromes) {
      insertAromeRow.run(recetteId, a.arome_id, a.dosage_custom ?? null, a.share, a.volume_calcule)
    }
    return recetteId
  })

  const id = transaction(body)
  res.status(201).json({ id })
})

export default router
