// ─── Duffel HTTP client ───────────────────────────────────────────────────────
// THIS FILE IS SERVER-SIDE ONLY.
// It reads DUFFEL_API_KEY from the environment. Never import this into a
// client component or expose it through any public-facing path.

if (typeof window !== 'undefined') {
  throw new Error(
    '[duffel/client] This module must not be imported in browser context. ' +
    'Use the /api/flights/search API route from the frontend instead.'
  )
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DUFFEL_API_BASE = 'https://api.duffel.com'
const DUFFEL_API_VERSION = 'v2'
const REQUEST_TIMEOUT_MS = 30_000

// ─── API Key resolution ───────────────────────────────────────────────────────

function resolveApiKey(): string {
  const key = process.env.DUFFEL_API_KEY
  if (!key || key.trim() === '') {
    throw new DuffelConfigError(
      'DUFFEL_API_KEY environment variable is missing or empty. ' +
      'Add it to .env.local for development or to your deployment environment for production.'
    )
  }
  return key.trim()
}

// ─── Error classes ────────────────────────────────────────────────────────────

export class DuffelConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DuffelConfigError'
  }
}

export class DuffelApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly type: string
  ) {
    super(message)
    this.name = 'DuffelApiError'
  }
}

export class DuffelNetworkError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DuffelNetworkError'
  }
}

// ─── Raw Duffel error shape ───────────────────────────────────────────────────

interface DuffelErrorBody {
  errors?: Array<{
    type: string
    code: string
    message: string
    title?: string
  }>
}

// ─── Request function ─────────────────────────────────────────────────────────

export interface DuffelRequestOptions {
  method: 'GET' | 'POST'
  path: string
  body?: unknown
}

export interface DuffelWrappedResponse<T> {
  data: T
}

export async function duffelRequest<T>(
  options: DuffelRequestOptions
): Promise<DuffelWrappedResponse<T>> {
  const apiKey = resolveApiKey()
  const { method, path, body } = options

  const url = `${DUFFEL_API_BASE}${path}`

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    'Duffel-Version': DUFFEL_API_VERSION,
    Accept: 'application/json',
    'Accept-Encoding': 'gzip',
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    const responseText = await response.text()
    let responseData: DuffelWrappedResponse<T> & DuffelErrorBody

    try {
      responseData = JSON.parse(responseText) as DuffelWrappedResponse<T> & DuffelErrorBody
    } catch {
      throw new DuffelApiError(
        'Duffel returned an invalid JSON response',
        response.status,
        'INVALID_RESPONSE',
        'parse_error'
      )
    }

    if (!response.ok) {
      const firstError = responseData.errors?.[0]

      if (response.status === 401 || response.status === 403) {
        throw new DuffelApiError(
          'Invalid or missing Duffel API key',
          response.status,
          firstError?.code ?? 'AUTH_ERROR',
          firstError?.type ?? 'authentication_error'
        )
      }

      if (response.status === 429) {
        throw new DuffelApiError(
          'Duffel API rate limit reached',
          429,
          'RATE_LIMIT_EXCEEDED',
          'rate_limit_error'
        )
      }

      if (response.status === 422 || response.status === 400) {
        throw new DuffelApiError(
          firstError?.message ?? 'Invalid search parameters',
          response.status,
          firstError?.code ?? 'VALIDATION_ERROR',
          firstError?.type ?? 'validation_error'
        )
      }

      throw new DuffelApiError(
        firstError?.message ?? `Duffel API error (HTTP ${response.status})`,
        response.status,
        firstError?.code ?? 'API_ERROR',
        firstError?.type ?? 'api_error'
      )
    }

    return responseData
  } catch (err) {
    if (err instanceof DuffelApiError || err instanceof DuffelConfigError) {
      throw err
    }

    if (err instanceof Error && err.name === 'AbortError') {
      throw new DuffelNetworkError(
        `Duffel API request timed out after ${REQUEST_TIMEOUT_MS / 1000}s`
      )
    }

    throw new DuffelNetworkError(
      `Failed to connect to Duffel API: ${err instanceof Error ? err.message : 'unknown network error'}`
    )
  } finally {
    clearTimeout(timer)
  }
}
