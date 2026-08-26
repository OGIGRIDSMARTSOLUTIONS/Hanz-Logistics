import { config } from 'dotenv'
import path from 'node:path'
import cors from 'cors'
import express from 'express'
import trackingRouter from './routes/tracking.js'

// Load backend/.env relative to this file (works from src/ or dist/),
// not process.cwd() — starting the server from the repo root must still work.
const backendRoot = path.resolve(__dirname, '..')
config({ path: path.join(backendRoot, '.env') })

const app = express()
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'

app.use(cors({ origin: corsOrigin }))
app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'hlo-tracking-backend' })
})

app.use('/api', trackingRouter)

export default app
