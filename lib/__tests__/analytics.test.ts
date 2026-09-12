import { describe, it, expect, vi, afterEach } from "vitest";
import { trackEvent } from "../analytics";

describe("trackEvent", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("sends a POST to /api/events with the event type and a session id", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 202, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);

    trackEvent("markets_viewed");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/events",
      expect.objectContaining({ method: "POST", keepalive: true }),
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.eventType).toBe("markets_viewed");
    expect(body.anonymousId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(body.metadata).toBeNull();
  });

  it("includes metadata when provided", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 202, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);

    trackEvent("market_position_placed", { outcome: "YES", stake: 100 });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.metadata).toEqual({ outcome: "YES", stake: 100 });
  });

  it("never throws when fetch itself rejects - telemetry must never break the page it measures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    expect(() => trackEvent("landing_viewed")).not.toThrow();
    await new Promise((resolve) => setTimeout(resolve, 0)); // let the rejected promise settle
  });

  it("never throws when fetch itself is unavailable/misbehaving (e.g. returns undefined synchronously)", () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(undefined));

    expect(() => trackEvent("landing_viewed")).not.toThrow();
  });

  it("does not call fetch at all when no session id is available (localStorage unavailable)", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const original = window.localStorage;
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("localStorage disabled");
      },
      configurable: true,
    });

    trackEvent("landing_viewed");

    expect(fetchMock).not.toHaveBeenCalled();
    Object.defineProperty(window, "localStorage", { value: original, configurable: true, writable: true });
  });
});
