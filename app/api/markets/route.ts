import { NextResponse } from "next/server";
import { BACKEND_BASE_URL } from "@/lib/api/config";

/** Same-origin proxy for GET/POST /api/v1/markets (Fortuna Markets Sprint 1). No POST UI exists in Sprint 1 (create remains API-only per the approved architecture), but the route itself is created per the approved plan's markets-client.ts coverage. */
export async function GET(request: Request): Promise<NextResponse> {
  const { search } = new URL(request.url);
  try {
    const upstream = await fetch(`${BACKEND_BASE_URL}/api/v1/markets${search}`, { method: "GET", cache: "no-store" });
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
  try {
    const upstream = await fetch(`${BACKEND_BASE_URL}/api/v1/markets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
