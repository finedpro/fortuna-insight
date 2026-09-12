import { NextResponse } from "next/server";
import { BACKEND_BASE_URL } from "@/lib/api/config";

/**
 * Server-side proxy to the real backend's GET /api/v1/analyses (Sprint
 * 5 Task 1) — same rationale as the two existing proxy routes (avoids
 * a browser CORS round-trip; the backend has no CORS middleware).
 * Forwards `limit`/`offset` query params and the backend's status code
 * and body verbatim.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { search } = new URL(request.url);

  try {
    const upstream = await fetch(`${BACKEND_BASE_URL}/api/v1/analyses${search}`, {
      method: "GET",
      cache: "no-store",
    });
    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: { code: "NETWORK_ERROR", message: "Could not reach the Fortuna backend. Is it running?" },
        meta: { requestId: "", timestamp: new Date().toISOString() },
      },
      { status: 502 },
    );
  }
}
