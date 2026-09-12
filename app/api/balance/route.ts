import { NextResponse } from "next/server";
import { BACKEND_BASE_URL } from "@/lib/api/config";

/** Same-origin proxy for GET /api/v1/balance (Fortuna Markets Sprint 1). Forwards X-Fortuna-Owner-Key through to the backend, which requires it. */
export async function GET(request: Request): Promise<NextResponse> {
  const ownerKey = request.headers.get("X-Fortuna-Owner-Key");
  try {
    const upstream = await fetch(`${BACKEND_BASE_URL}/api/v1/balance`, {
      method: "GET",
      cache: "no-store",
      headers: ownerKey ? { "X-Fortuna-Owner-Key": ownerKey } : {},
    });
    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { success: false, data: null, error: { code: "NETWORK_ERROR", message: "Could not reach the Fortuna backend. Is it running?" }, meta: { requestId: "", timestamp: new Date().toISOString() } },
      { status: 502 },
    );
  }
}
