import { config } from 'dotenv'
import path from 'node:path'

// Always load backend/.env relative to this file (works from src/ or dist/),
// not process.cwd() — starting the server from the repo root must still work.
const backendRoot = path.resolve(__dirname, '..')
config({ path: path.join(backendRoot, '.env') })
