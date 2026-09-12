import { NextResponse } from "next/server";
import { BACKEND_BASE_URL } from "@/lib/api/config";

/**
 * Server-side proxy to the real backend's POST /api/v1/analyze —
 * exists purely to avoid a browser CORS round-trip (the backend has no
 * CORS middleware, and adding one would mean touching backend code,
 * which this task explicitly rules out). The request/response bodies
 * and status code are forwarded verbatim; nothing is transformed,
 * validated twice, or invented here.
 */
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
    const upstream = await fetch(`${BACKEND_BASE_URL}/api/v1/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
