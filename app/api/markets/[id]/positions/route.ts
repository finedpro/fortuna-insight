import { NextResponse } from "next/server";
import { BACKEND_BASE_URL } from "@/lib/api/config";

/** Same-origin proxy for POST /api/v1/markets/{id}/positions (Fortuna Markets Sprint 1). Forwards X-Fortuna-Owner-Key through to the backend, which requires it. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, data: null, error: { code: "BAD_REQUEST", message: "Request body is not valid JSON." }, meta: { requestId: "", timestamp: new Date().toISOString() } },
      { status: 400 },
    );
  }
  const ownerKey = request.headers.get("X-Fortuna-Owner-Key");
  try {
    const upstream = await fetch(`${BACKEND_BASE_URL}/api/v1/markets/${encodeURIComponent(id)}/positions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(ownerKey ? { "X-Fortuna-Owner-Key": ownerKey } : {}),
      },
      body: JSON.stringify(body),
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
