/**
 * Polyfill for Node < 20.12: Vite 7 uses crypto.hash() which was added in Node 20.12.
 * Load this before Vite so the dev server starts on older Node (e.g. 18).
 * Vite calls crypto.hash(algorithm, data, encoding) and expects a string (e.g. .substring() on it).
 */
import crypto from 'node:crypto'
import { createHash } from 'node:crypto'
if (typeof crypto.hash !== 'function') {
  crypto.hash = (algorithm, data, encoding) => {
    const nodeAlg = String(algorithm).replace(/-/g, '')
    const hash = createHash(nodeAlg)
    if (data !== undefined && data !== null) hash.update(data)
    return hash.digest(encoding || 'hex')
  }
}
