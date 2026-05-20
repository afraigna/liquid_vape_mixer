import express from 'express'
import cors from 'cors'
import './db.js'
import aromesRouter from './routes/aromes.js'
import recettesRouter from './routes/recettes.js'

const app = express()
const PORT = 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/aromes', aromesRouter)
app.use('/api/recettes', recettesRouter)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
