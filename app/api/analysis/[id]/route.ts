import { NextResponse } from "next/server";
import { BACKEND_BASE_URL } from "@/lib/api/config";

/**
 * Server-side proxy to the real backend's GET /api/v1/analysis/{id} —
 * same rationale as app/api/analyze/route.ts. Forwards the backend's
 * status code and body exactly (a FAILED analysis's 422/500/502/504
 * passes straight through, not normalized to 200).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  try {
    const upstream = await fetch(`${BACKEND_BASE_URL}/api/v1/analysis/${encodeURIComponent(id)}`, {
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
