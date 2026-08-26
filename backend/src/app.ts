import cors from 'cors'
import express from 'express'
import trackingRouter from './routes/tracking.js'

const app = express()
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'

app.use(cors({ origin: corsOrigin }))
app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'hlo-tracking-backend' })
})

app.use('/api', trackingRouter)

export default app
