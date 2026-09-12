import { NextResponse } from "next/server";
import { BACKEND_BASE_URL } from "@/lib/api/config";

/** Same-origin proxy for GET /api/v1/markets/{id}/evidence (Fortuna Markets Sprint 2). */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await params;
  try {
    const upstream = await fetch(`${BACKEND_BASE_URL}/api/v1/markets/${encodeURIComponent(id)}/evidence`, { method: "GET", cache: "no-store" });
    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { success: false, data: null, error: { code: "NETWORK_ERROR", message: "Could not reach the Fortuna backend. Is it running?" }, meta: { requestId: "", timestamp: new Date().toISOString() } },
      { status: 502 },
    );
  }
}
