import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, '..', 'data', 'vape.db')

import fs from 'fs'
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })

export const db = new Database(DB_PATH)

db.exec(`
  CREATE TABLE IF NOT EXISTS aromes (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    nom              TEXT NOT NULL,
    image_url        TEXT,
    dosage_conseille REAL NOT NULL,
    dosage_custom    REAL,
    couleur          TEXT NOT NULL DEFAULT '#888780',
    created_at       TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS recettes (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    nom                 TEXT NOT NULL,
    volume_total        REAL NOT NULL,
    nicotine_cible      REAL NOT NULL,
    booster_nicotine    REAL NOT NULL,
    ratio_pg            REAL NOT NULL,
    volume_nicotine     REAL NOT NULL,
    volume_aromes_total REAL NOT NULL,
    volume_base         REAL NOT NULL,
    volume_pg           REAL NOT NULL,
    volume_vg           REAL NOT NULL,
    created_at          TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS recette_aromes (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    recette_id     INTEGER NOT NULL REFERENCES recettes(id) ON DELETE CASCADE,
    arome_id       INTEGER NOT NULL REFERENCES aromes(id),
    dosage_custom  REAL,
    share          REAL NOT NULL,
    volume_calcule REAL NOT NULL
  );
`)
