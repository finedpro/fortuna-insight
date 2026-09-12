import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import PositionsPage from "../page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/markets/positions",
}));

function mockFetchQueue(responses: Array<{ status: number; body: unknown }>) {
  const fn = vi.fn();
  for (const { status, body } of responses) {
    fn.mockResolvedValueOnce({ ok: status >= 200 && status < 300, status, json: async () => body } as Response);
  }
  vi.stubGlobal("fetch", fn);
  return fn;
}

const EMPTY_POSITIONS = { success: true, data: { items: [], limit: 20, offset: 0 }, error: null, meta: {} };
const LOADED_POSITIONS = {
  success: true,
  data: {
    items: [
      {
        id: "pos-1",
        marketId: "market-1",
        ownerKey: "550e8400-e29b-41d4-a716-446655440000",
        outcome: "YES",
        stake: 250,
        status: "pending",
        payout: null,
        createdAt: new Date().toISOString(),
        settledAt: null,
      },
    ],
    limit: 20,
    offset: 0,
  },
  error: null,
  meta: {},
};

describe("PositionsPage (/markets/positions)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("shows a loading state before positions resolve", () => {
    mockFetchQueue([{ status: 200, body: EMPTY_POSITIONS }]);
    render(<PositionsPage />);
    expect(screen.getByText(/loading positions/i)).toBeInTheDocument();
  });

  it("shows the empty state with clear, serious wording when there are no positions", async () => {
    mockFetchQueue([{ status: 200, body: EMPTY_POSITIONS }]);
    render(<PositionsPage />);
    await waitFor(() => expect(screen.getByText(/no predictions yet/i)).toBeInTheDocument());
  });

  it("renders loaded positions with outcome, stake, and status", async () => {
    mockFetchQueue([{ status: 200, body: LOADED_POSITIONS }]);
    render(<PositionsPage />);
    await waitFor(() => expect(screen.getByText(/yes · 250 pts/i)).toBeInTheDocument());
    expect(screen.getByText("pending")).toBeInTheDocument();
  });

  it("shows an error state and retry action on API failure", async () => {
    mockFetchQueue([{ status: 502, body: { success: false, data: null, error: { code: "NETWORK_ERROR", message: "Could not reach Fortuna." }, meta: {} } }]);
    render(<PositionsPage />);
    await waitFor(() => expect(screen.getByText(/could not load positions/i)).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });
});
