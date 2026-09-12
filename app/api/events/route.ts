import { NextResponse } from "next/server";
import { BACKEND_BASE_URL } from "@/lib/api/config";

/** Same-origin proxy for POST /api/v1/events (soft-launch instrumentation). No X-Fortuna-Owner-Key forwarded - this is a separate, anonymous concern from Markets identity. */
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
    const upstream = await fetch(`${BACKEND_BASE_URL}/api/v1/events`, {
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
