/**
 * Vercel serverless entry for the HLO Express API.
 * Routes /api/* (and /health via vercel.json rewrite) to the existing Express app.
 */
import app from '../backend/src/app.js'

export default app
