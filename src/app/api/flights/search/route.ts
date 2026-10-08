// ─── POST /api/flights/search ─────────────────────────────────────────────────
// Accepts a flight search request from the frontend, validates it, calls the
// flight service, and returns a normalized JSON response. Never exposes Duffel
// details, API keys, or internal error messages to the caller.

import { NextRequest, NextResponse } from 'next/server'
import {
  searchFlights,
  validateSearchRequest,
  FlightServiceError,
} from '@/lib/services/flight-service'
import type { ApiErrorResponse, FlightSearchResponse } from '@/lib/types/flights'

// Only POST is accepted. Next.js returns 405 automatically for other methods
// because we only export `POST`.

export async function POST(req: NextRequest): Promise<NextResponse<FlightSearchResponse | ApiErrorResponse>> {
  // ── Parse body ─────────────────────────────────────────────────────────────
  let body: unknown

  try {
    body = await req.json()
  } catch {
    return NextResponse.json<ApiErrorResponse>(
      {
        error: 'O corpo da requisição deve ser um JSON válido.',
        code: 'VALIDATION_ERROR',
      },
      { status: 400 }
    )
  }

  // ── Validate input ──────────────────────────────────────────────────────────
  const validation = validateSearchRequest(body)

  if (!validation.valid) {
    const firstError = validation.errors[0]
    console.warn(`[api/flights/search] validation error`, {
      errors: validation.errors,
    })
    return NextResponse.json<ApiErrorResponse>(
      {
        error: firstError.message,
        code: 'VALIDATION_ERROR',
      },
      { status: 422 }
    )
  }

  // ── Call service ────────────────────────────────────────────────────────────
  try {
    const result = await searchFlights(validation.request)

    if (result.count === 0) {
      return NextResponse.json<ApiErrorResponse>(
        {
          error: 'Nenhum voo encontrado para os parâmetros informados. Tente outras datas ou aeroportos.',
          code: 'NO_RESULTS',
        },
        { status: 404 }
      )
    }

    return NextResponse.json<FlightSearchResponse>(result, { status: 200 })
  } catch (err) {
    if (err instanceof FlightServiceError) {
      return NextResponse.json<ApiErrorResponse>(
        {
          error: err.message,
          code: err.code,
        },
        { status: err.httpStatus }
      )
    }

    // Catch-all — should never reach here if service handles all cases
    console.error(`[api/flights/search] unhandled error`, {
      error: err instanceof Error ? err.message : String(err),
    })

    return NextResponse.json<ApiErrorResponse>(
      {
        error: 'Erro interno. Tente novamente ou entre em contato pelo WhatsApp.',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    )
  }
}
