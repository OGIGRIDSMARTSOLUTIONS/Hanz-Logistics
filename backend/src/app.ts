import cors from 'cors'
import express from 'express'
import trackingRouter from './routes/tracking.js'

const app = express()
const configuredOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true)
      if (configuredOrigins.includes('*') || configuredOrigins.includes(origin)) {
        return callback(null, true)
      }
      if (/^https:\/\/([a-z0-9-]+\.)?hanz-logistics.*\.vercel\.app$/i.test(origin)) {
        return callback(null, true)
      }
      return callback(null, false)
    },
  }),
)
app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'hlo-tracking-backend' })
})

app.use('/api', trackingRouter)

export default app
