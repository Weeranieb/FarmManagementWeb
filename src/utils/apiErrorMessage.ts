/**
 * Translate a backend `HttpError` into a Thai message based on its numeric
 * AppError code. Keeps backend messages in English (better for logs, Swagger,
 * and dev tools) while showing localized strings to end users.
 *
 * Codes come from backend `errors/codes.go` (e.g. ErrPondAlreadyExists.Code).
 * Anything not in the map falls back to the backend's English message; if
 * the input isn't an Error at all, returns the optional `fallback` or a
 * generic Thai message.
 */
import { HttpError } from '../lib/api-client'
import { th } from '../locales/th'

const L = th.adminMasterData

// Keep keys as strings — HttpError.code is a string in the api client.
const BACKEND_ERROR_TH: Record<string, string> = {
  '500010': L.apiErrorValidationFailed,
  '500024': L.apiErrorPermissionDenied,
  '500040': L.apiErrorFarmNotFound,
  '500041': L.apiErrorFarmAlreadyExists,
  '500070': L.apiErrorPondNotFound,
  '500071': L.apiErrorPondAlreadyExists,
}

/**
 * Resolve a user-facing error message for an unknown caught value.
 *
 * Priority:
 *   1. HttpError + known code → Thai map
 *   2. HttpError + unknown code → backend's English message (still useful)
 *   3. Generic Error → its .message
 *   4. Anything else → `fallback` (caller-provided) or a generic Thai string
 */
export function getApiErrorMessage(err: unknown, fallback?: string): string {
  if (err instanceof HttpError) {
    const mapped = err.code ? BACKEND_ERROR_TH[err.code] : undefined
    if (mapped) return mapped
    if (err.message) return err.message
  }
  if (err instanceof Error && err.message) return err.message
  return fallback ?? L.apiErrorGeneric
}
