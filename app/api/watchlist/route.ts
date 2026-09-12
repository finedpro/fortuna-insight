import { NextResponse } from "next/server";
import { BACKEND_BASE_URL } from "@/lib/api/config";

/** Same-origin proxy for GET/POST /api/v1/watchlist (Sprint 6 Task 1) - same rationale as every other proxy route in this app: avoids a browser CORS round-trip. */
export async function GET(request: Request): Promise<NextResponse> {
  const { search } = new URL(request.url);
  try {
    const upstream = await fetch(`${BACKEND_BASE_URL}/api/v1/watchlist${search}`, { method: "GET", cache: "no-store" });
    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { success: false, data: null, error: { code: "NETWORK_ERROR", message: "Could not reach the Fortuna backend. Is it running?" }, meta: { requestId: "", timestamp: new Date().toISOString() } },
      { status: 502 },
    );
  }
}

export async function POST(request: Request): Promise<NextResponse> {
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
    const upstream = await fetch(`${BACKEND_BASE_URL}/api/v1/watchlist`, {
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
