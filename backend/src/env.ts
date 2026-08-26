import { config } from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Always load backend/.env relative to this file (works from src/ or dist/),
// not process.cwd() — starting the server from the repo root must still work.
const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
config({ path: path.join(backendRoot, '.env') })
