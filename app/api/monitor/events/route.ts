import { NextResponse } from "next/server";
import { BACKEND_BASE_URL } from "@/lib/api/config";

/** Same-origin proxy for GET /api/v1/monitor/events (Sprint 6 Task 1). */
export async function GET(request: Request): Promise<NextResponse> {
  const { search } = new URL(request.url);
  try {
    const upstream = await fetch(`${BACKEND_BASE_URL}/api/v1/monitor/events${search}`, { method: "GET", cache: "no-store" });
    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { success: false, data: null, error: { code: "NETWORK_ERROR", message: "Could not reach the Fortuna backend. Is it running?" }, meta: { requestId: "", timestamp: new Date().toISOString() } },
      { status: 502 },
    );
  }
}
