import { Router, Request, Response } from 'express'
import { db } from '../db.js'

const router = Router()

router.get('/', (_req: Request, res: Response) => {
  const aromes = db.prepare('SELECT * FROM aromes ORDER BY id').all()
  res.json(aromes)
})

router.post('/', (req: Request, res: Response) => {
  const { nom, image_url, dosage_conseille, dosage_custom, couleur } = req.body as {
    nom: string
    image_url: string | null
    dosage_conseille: number
    dosage_custom: number | null
    couleur: string
  }

  if (!nom || typeof dosage_conseille !== 'number') {
    res.status(400).json({ error: 'nom et dosage_conseille sont obligatoires' })
    return
  }

  const stmt = db.prepare(
    `INSERT INTO aromes (nom, image_url, dosage_conseille, dosage_custom, couleur)
     VALUES (?, ?, ?, ?, ?)`,
  )
  const result = stmt.run(
    nom.trim(),
    image_url ?? null,
    dosage_conseille,
    dosage_custom ?? null,
    couleur ?? '#888780',
  )

  const created = db.prepare('SELECT * FROM aromes WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(created)
})

export default router
