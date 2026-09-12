import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import MarketsPage from "../page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/markets",
}));

function mockFetchQueue(responses: Array<{ status: number; body: unknown }>) {
  const fn = vi.fn();
  for (const { status, body } of responses) {
    fn.mockResolvedValueOnce({ ok: status >= 200 && status < 300, status, json: async () => body } as Response);
  }
  vi.stubGlobal("fetch", fn);
  return fn;
}

const EMPTY_MARKETS = { success: true, data: { items: [], limit: 20, offset: 0 }, error: null, meta: {} };
const BALANCE = { success: true, data: { ownerKey: "550e8400-e29b-41d4-a716-446655440000", balance: 10_000 }, error: null, meta: {} };
const MARKET = {
  subject: { type: "WALLET", reference: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM" },
  id: "market-1",
  question: "Will BTC be above $120,000?",
  status: "OPEN",
  closesAt: new Date(Date.now() + 86_400_000).toISOString(),
  resolvedOutcome: null,
  totalYesStake: 620,
  totalNoStake: 380,
  impliedProbabilityYes: 0.62,
  createdAt: new Date().toISOString(),
  resolvedAt: null,
  updatedAt: new Date().toISOString(),
};
const LOADED_MARKETS = { success: true, data: { items: [MARKET], limit: 20, offset: 0 }, error: null, meta: {} };

describe("MarketsPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("shows a loading state before markets resolve", () => {
    mockFetchQueue([
      { status: 200, body: EMPTY_MARKETS },
      { status: 200, body: BALANCE },
    ]);
    render(<MarketsPage />);
    expect(screen.getByText(/loading markets/i)).toBeInTheDocument();
  });

  it("shows the empty state when there are no markets", async () => {
    mockFetchQueue([
      { status: 200, body: EMPTY_MARKETS },
      { status: 200, body: BALANCE },
    ]);
    render(<MarketsPage />);
    await waitFor(() => expect(screen.getByText(/no markets yet/i)).toBeInTheDocument());
  });

  it("renders loaded markets with pool distribution clearly labeled", async () => {
    mockFetchQueue([
      { status: 200, body: LOADED_MARKETS },
      { status: 200, body: BALANCE },
    ]);
    render(<MarketsPage />);
    await waitFor(() => expect(screen.getByText(MARKET.question)).toBeInTheDocument());
    expect(screen.getByText(/current pool/i)).toBeInTheDocument();
    expect(screen.getByText(/62% yes/i)).toBeInTheDocument();
    // Never claims to be an AI/predicted probability.
    expect(screen.queryByText(/ai probability/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/predicted probability/i)).not.toBeInTheDocument();
  });

  it("shows the virtual balance using points language, never a currency symbol", async () => {
    mockFetchQueue([
      { status: 200, body: EMPTY_MARKETS },
      { status: 200, body: BALANCE },
    ]);
    render(<MarketsPage />);
    await waitFor(() => expect(screen.getByText("10000 pts")).toBeInTheDocument());
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
  });

  it("shows an error state and retry action on API failure", async () => {
    mockFetchQueue([
      { status: 502, body: { success: false, data: null, error: { code: "NETWORK_ERROR", message: "Could not reach Fortuna." }, meta: {} } },
      { status: 200, body: BALANCE },
    ]);
    render(<MarketsPage />);
    await waitFor(() => expect(screen.getByText(/could not load markets/i)).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("has a My Positions link to /markets/positions", async () => {
    mockFetchQueue([
      { status: 200, body: EMPTY_MARKETS },
      { status: 200, body: BALANCE },
    ]);
    render(<MarketsPage />);
    await waitFor(() => expect(screen.getByRole("link", { name: /my positions/i })).toHaveAttribute("href", "/markets/positions"));
  });

  it("links each market card to its detail route", async () => {
    mockFetchQueue([
      { status: 200, body: LOADED_MARKETS },
      { status: 200, body: BALANCE },
    ]);
    render(<MarketsPage />);
    await waitFor(() => expect(screen.getByText(MARKET.question)).toBeInTheDocument());
    const links = screen.getAllByRole("link");
    const marketLink = links.find((link) => link.getAttribute("href") === "/markets/market-1");
    expect(marketLink).toBeDefined();
  });
});
