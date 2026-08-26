/**
 * Local development only — imported by server.ts, not by app.ts (Vercel entrypoint).
 * Production on Vercel uses process.env from the project dashboard.
 */
import { config } from 'dotenv'
import path from 'node:path'

const backendRoot = path.resolve(__dirname, '..')
config({ path: path.join(backendRoot, '.env') })
