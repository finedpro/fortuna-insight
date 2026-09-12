import { NextResponse } from "next/server";
import { BACKEND_BASE_URL } from "@/lib/api/config";

/** Same-origin proxy for DELETE /api/v1/watchlist/{id} (Sprint 6 Task 1). Forwards X-Fortuna-Owner-Key through to the backend, which requires it for ownership verification (launch-readiness hardening). */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await params;
  const ownerKey = request.headers.get("X-Fortuna-Owner-Key");
  try {
    const upstream = await fetch(`${BACKEND_BASE_URL}/api/v1/watchlist/${encodeURIComponent(id)}`, {
      method: "DELETE",
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
