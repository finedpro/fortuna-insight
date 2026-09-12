import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MarketDetailPage from "../page";
import { trackEvent } from "@/lib/analytics";

vi.mock("next/navigation", () => ({
  usePathname: () => "/markets/market-1",
}));

// Soft-launch instrumentation fires its own fetch("/api/events", ...) calls
// at several points on this page (market_detail_viewed, evidence_viewed,
// market_position_started/placed). Mocked out here so those calls never
// consume a slot in mockFetchSequence's strict, ordered queue - this test
// file is about Markets business behavior, not telemetry, which has its
// own dedicated test coverage in lib/__tests__/analytics.test.ts.
vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn(),
}));

function mockFetchSequence(responses: Array<{ status: number; body: unknown }>) {
  const fn = vi.fn();
  for (const { status, body } of responses) {
    fn.mockResolvedValueOnce({ ok: status >= 200 && status < 300, status, json: async () => body } as Response);
  }
  vi.stubGlobal("fetch", fn);
  return fn;
}

const OPEN_MARKET = {
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
const CLOSED_MARKET = { ...OPEN_MARKET, closesAt: new Date(Date.now() - 1000).toISOString() };
const ASSET_MARKET = { ...OPEN_MARKET, subject: { type: "ASSET", reference: "BTC" }, question: "Will BTC be above $120,000 at market close?" };
const RESOLVED_MARKET = { ...OPEN_MARKET, status: "RESOLVED", resolvedOutcome: "YES", resolvedAt: new Date().toISOString() };

const BALANCE = { success: true, data: { ownerKey: "550e8400-e29b-41d4-a716-446655440000", balance: 10_000 }, error: null, meta: {} };
const EMPTY_POSITIONS = { success: true, data: { items: [], limit: 20, offset: 0 }, error: null, meta: {} };
const EMPTY_EVIDENCE = { success: true, data: { marketId: "market-1", items: [], generatedAt: new Date().toISOString() }, error: null, meta: {} };

/** Hook call order in MarketDetail: useMarket, useBalance, usePositions, useMarketEvidence (Sprint 2) - each fires one fetch on mount, in that order. */
function baseSequence(marketBody: unknown) {
  return [
    { status: 200, body: { success: true, data: marketBody, error: null, meta: {} } },
    { status: 200, body: BALANCE },
    { status: 200, body: EMPTY_POSITIONS },
    { status: 200, body: EMPTY_EVIDENCE },
  ];
}

async function renderDetail(id = "market-1") {
  const jsx = await MarketDetailPage({ params: Promise.resolve({ id }) });
  render(jsx);
}

describe("MarketDetailPage (/markets/[id])", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.mocked(trackEvent).mockClear();
    localStorage.clear();
  });

  it("loads and renders an open market with its pools and prediction panel", async () => {
    mockFetchSequence(baseSequence(OPEN_MARKET));
    await renderDetail();

    await waitFor(() => expect(screen.getByText(OPEN_MARKET.question)).toBeInTheDocument());
    expect(screen.getByText("620 pts")).toBeInTheDocument();
    expect(screen.getByText("380 pts")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: /choose yes or no/i })).toBeInTheDocument();
  });

  it("allows selecting YES or NO via keyboard-accessible buttons", async () => {
    mockFetchSequence(baseSequence(OPEN_MARKET));
    await renderDetail();
    await waitFor(() => expect(screen.getByText(OPEN_MARKET.question)).toBeInTheDocument());

    const user = userEvent.setup();
    const yesButton = screen.getByRole("button", { name: /^yes/i });
    await user.click(yesButton);

    expect(yesButton).toHaveAttribute("aria-pressed", "true");
  });

  it("rejects an invalid (fractional) stake client-side without submitting", async () => {
    mockFetchSequence(baseSequence(OPEN_MARKET));
    await renderDetail();
    await waitFor(() => expect(screen.getByText(OPEN_MARKET.question)).toBeInTheDocument());

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /^yes/i }));
    await user.type(screen.getByLabelText(/stake/i), "10.5");

    expect(screen.getByText(/must be a positive whole number/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /predict/i })).toBeDisabled();
  });

  it("places a position successfully and shows the success state", async () => {
    const fetchMock = mockFetchSequence([
      ...baseSequence(OPEN_MARKET),
      { status: 201, body: { success: true, data: { id: "pos-1", marketId: "market-1", ownerKey: "o1", outcome: "YES", stake: 250, status: "pending", payout: null, createdAt: new Date().toISOString(), settledAt: null }, error: null, meta: {} } },
      { status: 200, body: { success: true, data: OPEN_MARKET, error: null, meta: {} } },
      { status: 200, body: BALANCE },
      { status: 200, body: EMPTY_POSITIONS },
    ]);
    await renderDetail();
    await waitFor(() => expect(screen.getByText(OPEN_MARKET.question)).toBeInTheDocument());

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /^yes/i }));
    await user.type(screen.getByLabelText(/stake/i), "250");
    await user.click(screen.getByRole("button", { name: /^predict$/i }));

    await waitFor(() => expect(screen.getByText(/prediction placed/i)).toBeInTheDocument());
    expect(screen.getByText(/yes · 250 pts/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/markets/market-1/positions",
      expect.objectContaining({ method: "POST", headers: expect.objectContaining({ "X-Fortuna-Owner-Key": expect.any(String) }) }),
    );
  });

  it("shows the disabled/loading submit state while a placement is in flight", async () => {
    let resolvePlacement!: (value: unknown) => void;
    const fetchMock = vi.fn();
    for (const r of baseSequence(OPEN_MARKET)) {
      fetchMock.mockResolvedValueOnce({ ok: true, status: r.status, json: async () => r.body } as Response);
    }
    fetchMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePlacement = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await renderDetail();
    await waitFor(() => expect(screen.getByText(OPEN_MARKET.question)).toBeInTheDocument());

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /^yes/i }));
    await user.type(screen.getByLabelText(/stake/i), "100");
    const submitButton = screen.getByRole("button", { name: /^predict$/i });
    await user.click(submitButton);

    await waitFor(() => expect(submitButton).toBeDisabled());
    expect(submitButton).toHaveAttribute("aria-busy", "true");

    // Resolve so the pending promise doesn't leak into the next test.
    resolvePlacement({
      ok: true,
      status: 201,
      json: async () => ({ success: true, data: { id: "pos-1", marketId: "market-1", ownerKey: "o1", outcome: "YES", stake: 100, status: "pending", payout: null, createdAt: new Date().toISOString(), settledAt: null }, error: null, meta: {} }),
    });
  });

  it("shows the insufficient-balance error inline, never as a toast", async () => {
    mockFetchSequence([
      ...baseSequence(OPEN_MARKET),
      { status: 422, body: { success: false, data: null, error: { code: "INSUFFICIENT_BALANCE", message: "Balance is insufficient for this stake." }, meta: {} } },
    ]);
    await renderDetail();
    await waitFor(() => expect(screen.getByText(OPEN_MARKET.question)).toBeInTheDocument());

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /^yes/i }));
    await user.type(screen.getByLabelText(/stake/i), "50000");
    await user.click(screen.getByRole("button", { name: /^predict$/i }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/insufficient/i));
  });

  it("disables prediction and explains a closed market", async () => {
    mockFetchSequence(baseSequence(CLOSED_MARKET));
    await renderDetail();

    await waitFor(() => expect(screen.getByText(/closed.*awaiting resolution/i)).toBeInTheDocument());
    expect(screen.queryByRole("group", { name: /choose yes or no/i })).not.toBeInTheDocument();
  });

  it("displays the resolved outcome and the user's settled position with payout", async () => {
    const myPosition = {
      id: "pos-1",
      marketId: "market-1",
      ownerKey: "550e8400-e29b-41d4-a716-446655440000",
      outcome: "YES",
      stake: 250,
      status: "settled",
      payout: 400,
      createdAt: new Date().toISOString(),
      settledAt: new Date().toISOString(),
    };
    mockFetchSequence([
      { status: 200, body: { success: true, data: RESOLVED_MARKET, error: null, meta: {} } },
      { status: 200, body: BALANCE },
      { status: 200, body: { success: true, data: { items: [myPosition], limit: 20, offset: 0 }, error: null, meta: {} } },
      { status: 200, body: EMPTY_EVIDENCE },
    ]);
    await renderDetail();

    await waitFor(() => expect(screen.getByText(/outcome: yes/i)).toBeInTheDocument());
    expect(screen.getByText(/payout: 400 pts/i)).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: /choose yes or no/i })).not.toBeInTheDocument();
  });

  it("displays the market's subject factually - type and reference, never implying a prediction", async () => {
    mockFetchSequence(baseSequence(OPEN_MARKET));
    await renderDetail();

    await waitFor(() => expect(screen.getByText("Subject")).toBeInTheDocument());
    expect(screen.getByText(/wallet/i)).toBeInTheDocument();
    expect(screen.getByText("9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM")).toBeInTheDocument();
  });

  it("renders an ASSET market correctly - factual subject label, honest empty evidence, prediction panel still available (Sprint 4)", async () => {
    mockFetchSequence(baseSequence(ASSET_MARKET));
    await renderDetail();

    await waitFor(() => expect(screen.getByText(ASSET_MARKET.question)).toBeInTheDocument());
    expect(screen.getByText(/asset/i)).toBeInTheDocument();
    expect(screen.getByText("BTC")).toBeInTheDocument();
    expect(screen.getByText(/no relevant evidence available yet/i)).toBeInTheDocument();
    expect(screen.getByRole("group", { name: /choose yes or no/i })).toBeInTheDocument(); // the user still makes the prediction themselves

    // No forbidden prediction/odds language anywhere, for an ASSET market either.
    expect(screen.queryByText(/\bodds\b/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/bullish/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/bearish/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/recommended/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/predicted probability/i)).not.toBeInTheDocument();
  });

  it("displays Fresh freshness clearly, not color-only (Sprint 6)", async () => {
    const item = { id: "ev-1", category: "assets", title: "BTC price", description: "BTC was observed at 111234.56 USD.", severity: "info", confidence: "high", source: "coingecko", timestamp: new Date().toISOString(), quality: { observedAt: new Date().toISOString(), ageSeconds: 5, freshness: "FRESH", source: "coingecko" } };
    mockFetchSequence([
      { status: 200, body: { success: true, data: ASSET_MARKET, error: null, meta: {} } },
      { status: 200, body: BALANCE },
      { status: 200, body: EMPTY_POSITIONS },
      { status: 200, body: { success: true, data: { marketId: "market-1", subject: ASSET_MARKET.subject, items: [item], generatedAt: new Date().toISOString() }, error: null, meta: {} } },
    ]);
    await renderDetail();

    await waitFor(() => expect(screen.getByText("Fresh")).toBeInTheDocument());
    expect(screen.getByText(/5 seconds ago/i)).toBeInTheDocument();
  });

  it("displays Stale freshness clearly - stale evidence is shown, never hidden (Sprint 6)", async () => {
    const item = { id: "ev-1", category: "assets", title: "BTC price", description: "BTC was observed at 111234.56 USD.", severity: "info", confidence: "high", source: "coingecko", timestamp: new Date().toISOString(), quality: { observedAt: new Date().toISOString(), ageSeconds: 3600, freshness: "STALE", source: "coingecko" } };
    mockFetchSequence([
      { status: 200, body: { success: true, data: ASSET_MARKET, error: null, meta: {} } },
      { status: 200, body: BALANCE },
      { status: 200, body: EMPTY_POSITIONS },
      { status: 200, body: { success: true, data: { marketId: "market-1", subject: ASSET_MARKET.subject, items: [item], generatedAt: new Date().toISOString() }, error: null, meta: {} } },
    ]);
    await renderDetail();

    await waitFor(() => expect(screen.getByText("Stale")).toBeInTheDocument());
    expect(screen.getByText("BTC price")).toBeInTheDocument(); // stale evidence is NOT hidden/removed
    expect(screen.getByText(/1 hour ago/i)).toBeInTheDocument();
  });

  it("displays Unknown freshness for an invalid/missing observation time (Sprint 6)", async () => {
    const item = { id: "ev-1", category: "assets", title: "BTC price", description: "BTC was observed at 111234.56 USD.", severity: "info", confidence: "high", source: "coingecko", timestamp: "invalid", quality: { observedAt: null, ageSeconds: null, freshness: "UNKNOWN", source: "coingecko" } };
    mockFetchSequence([
      { status: 200, body: { success: true, data: ASSET_MARKET, error: null, meta: {} } },
      { status: 200, body: BALANCE },
      { status: 200, body: EMPTY_POSITIONS },
      { status: 200, body: { success: true, data: { marketId: "market-1", subject: ASSET_MARKET.subject, items: [item], generatedAt: new Date().toISOString() }, error: null, meta: {} } },
    ]);
    await renderDetail();

    await waitFor(() => expect(screen.getByText("Unknown")).toBeInTheDocument());
  });

  it("renders real asset evidence when the provider returns a factual price observation (Sprint 5)", async () => {
    const priceEvidence = {
      id: "ev-btc-1",
      category: "assets",
      title: "BTC price",
      description: "BTC was observed at 111234.56 USD.",
      severity: "info",
      confidence: "high",
      source: "coingecko",
      timestamp: "2026-09-08T15:21:00.000Z",
      quality: { observedAt: "2026-09-08T15:21:00.000Z", ageSeconds: 42, freshness: "FRESH", source: "coingecko" },
    };
    mockFetchSequence([
      { status: 200, body: { success: true, data: ASSET_MARKET, error: null, meta: {} } },
      { status: 200, body: BALANCE },
      { status: 200, body: EMPTY_POSITIONS },
      { status: 200, body: { success: true, data: { marketId: "market-1", subject: ASSET_MARKET.subject, items: [priceEvidence], generatedAt: new Date().toISOString() }, error: null, meta: {} } },
    ]);
    await renderDetail();

    await waitFor(() => expect(screen.getByText("BTC price")).toBeInTheDocument());
    expect(screen.getByText(/111234\.56/)).toBeInTheDocument();
    expect(screen.getByText(/usd/i)).toBeInTheDocument();
    expect(screen.getByText(/^observed/i)).toBeInTheDocument();
    expect(screen.getByText(/coingecko/i)).toBeInTheDocument();

    // Still no prediction/probability/recommendation language anywhere.
    expect(screen.queryByText(/probability/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\bodds\b/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/recommend/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/target/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/bullish/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/bearish/i)).not.toBeInTheDocument();
  });

  it("shows a safe, factual error state when asset evidence retrieval fails - never disguised as 'no evidence' (Sprint 5, §21)", async () => {
    mockFetchSequence([
      { status: 200, body: { success: true, data: ASSET_MARKET, error: null, meta: {} } },
      { status: 200, body: BALANCE },
      { status: 200, body: EMPTY_POSITIONS },
      { status: 500, body: { success: false, data: null, error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred." }, meta: {} } },
    ]);
    await renderDetail();

    await waitFor(() => expect(screen.getByText(/temporarily unavailable/i)).toBeInTheDocument());
    expect(screen.queryByText(/no relevant evidence available yet/i)).not.toBeInTheDocument();
    // Never leaks internal error details to the user.
    expect(screen.queryByText(/internal_error/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/unexpected error occurred/i)).not.toBeInTheDocument();
  });

  it("shows the virtual-points disclaimer on the market detail page, before the YES/NO controls (launch polish - Task 3)", async () => {
    mockFetchSequence(baseSequence(OPEN_MARKET));
    await renderDetail();

    await waitFor(() => expect(screen.getByText(OPEN_MARKET.question)).toBeInTheDocument());
    const disclaimer = screen.getByText(/virtual points only.*no monetary value/i);
    expect(disclaimer).toBeInTheDocument();

    const yesButton = screen.getByRole("button", { name: /^yes/i });
    // DOM order check: the disclaimer element must precede the YES/NO control group in document position.
    expect(disclaimer.compareDocumentPosition(yesButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("presents Evidence before the pool/decision section - Question -> Evidence -> Decision (launch polish - Task 4)", async () => {
    const evidenceItem = { id: "ev-1", category: "assets", title: "BTC price", description: "BTC was observed at 111234.56 USD.", severity: "info", confidence: "high", source: "coingecko", timestamp: new Date().toISOString(), quality: { observedAt: new Date().toISOString(), ageSeconds: 5, freshness: "FRESH", source: "coingecko" } };
    mockFetchSequence([
      { status: 200, body: { success: true, data: OPEN_MARKET, error: null, meta: {} } },
      { status: 200, body: BALANCE },
      { status: 200, body: EMPTY_POSITIONS },
      { status: 200, body: { success: true, data: { marketId: "market-1", subject: OPEN_MARKET.subject, items: [evidenceItem], generatedAt: new Date().toISOString() }, error: null, meta: {} } },
    ]);
    await renderDetail();

    await waitFor(() => expect(screen.getByText("BTC price")).toBeInTheDocument());
    const evidenceHeading = screen.getByText("BTC price");
    const poolHeading = screen.getByText("YES Pool");
    const yesButton = screen.getByRole("button", { name: /^yes/i });

    // Evidence must appear before Pool in the DOM.
    expect(evidenceHeading.compareDocumentPosition(poolHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // Evidence must appear before the decision controls.
    expect(evidenceHeading.compareDocumentPosition(yesButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("fires market_detail_viewed and evidence_viewed exactly once each on mount (soft-launch instrumentation)", async () => {
    mockFetchSequence(baseSequence(OPEN_MARKET));
    await renderDetail();

    await waitFor(() => expect(screen.getByText(OPEN_MARKET.question)).toBeInTheDocument());

    const detailCalls = vi.mocked(trackEvent).mock.calls.filter(([type]) => type === "market_detail_viewed");
    const evidenceCalls = vi.mocked(trackEvent).mock.calls.filter(([type]) => type === "evidence_viewed");
    expect(detailCalls).toHaveLength(1);
    expect(evidenceCalls).toHaveLength(1);
    expect(detailCalls[0][1]).toEqual({ subjectType: "WALLET" });
  });

  it("fires market_position_started once on the first YES/NO pick, not again on a second pick", async () => {
    mockFetchSequence(baseSequence(OPEN_MARKET));
    await renderDetail();
    await waitFor(() => expect(screen.getByText(OPEN_MARKET.question)).toBeInTheDocument());

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /^yes/i }));
    await user.click(screen.getByRole("button", { name: /^no/i })); // changed their mind

    const startedCalls = vi.mocked(trackEvent).mock.calls.filter(([type]) => type === "market_position_started");
    expect(startedCalls).toHaveLength(1);
    expect(startedCalls[0][1]).toEqual({ outcome: "YES" }); // reflects the FIRST pick only
  });

  it("fires market_position_placed only after the backend genuinely accepts the position - never on submit itself", async () => {
    mockFetchSequence([
      ...baseSequence(OPEN_MARKET),
      { status: 201, body: { success: true, data: { id: "pos-1", marketId: "market-1", ownerKey: "o1", outcome: "YES", stake: 250, status: "pending", payout: null, createdAt: new Date().toISOString(), settledAt: null }, error: null, meta: {} } },
      { status: 200, body: { success: true, data: OPEN_MARKET, error: null, meta: {} } },
      { status: 200, body: BALANCE },
      { status: 200, body: EMPTY_POSITIONS },
    ]);
    await renderDetail();
    await waitFor(() => expect(screen.getByText(OPEN_MARKET.question)).toBeInTheDocument());

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /^yes/i }));
    await user.type(screen.getByLabelText(/stake/i), "250");
    await user.click(screen.getByRole("button", { name: /^predict$/i }));

    await waitFor(() => expect(screen.getByText(/prediction placed/i)).toBeInTheDocument());
    const placedCalls = vi.mocked(trackEvent).mock.calls.filter(([type]) => type === "market_position_placed");
    expect(placedCalls).toHaveLength(1);
    expect(placedCalls[0][1]).toEqual({ outcome: "YES", stake: 250 });
  });

  it("never fires market_position_placed when the backend rejects the placement - a failed request never creates a false success event", async () => {
    mockFetchSequence([
      ...baseSequence(OPEN_MARKET),
      { status: 422, body: { success: false, data: null, error: { code: "INSUFFICIENT_BALANCE", message: "Not enough points." }, meta: {} } },
    ]);
    await renderDetail();
    await waitFor(() => expect(screen.getByText(OPEN_MARKET.question)).toBeInTheDocument());

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /^yes/i }));
    await user.type(screen.getByLabelText(/stake/i), "999999");
    await user.click(screen.getByRole("button", { name: /^predict$/i }));

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    const placedCalls = vi.mocked(trackEvent).mock.calls.filter(([type]) => type === "market_position_placed");
    expect(placedCalls).toHaveLength(0);
  });

  it("never displays AI-probability language anywhere on the detail page", async () => {
    mockFetchSequence(baseSequence(OPEN_MARKET));
    await renderDetail();
    await waitFor(() => expect(screen.getByText(OPEN_MARKET.question)).toBeInTheDocument());

    expect(screen.queryByText(/ai probability/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/predicted probability/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\bodds\b/i)).not.toBeInTheDocument();
  });

  it("shows the honest empty-evidence message when the market has no relevant evidence yet (Sprint 2)", async () => {
    mockFetchSequence(baseSequence(OPEN_MARKET));
    await renderDetail();

    await waitFor(() => expect(screen.getByText(/no relevant evidence available yet/i)).toBeInTheDocument());
  });

  it("renders an evidence item's full fields when the provider returns one (Sprint 2)", async () => {
    const evidenceItem = {
      id: "ev-1",
      category: "wallet_age",
      title: "Wallet age",
      description: "This wallet has been active for 420 days.",
      severity: "info",
      confidence: "high",
      source: "wallet_health_result",
      timestamp: new Date().toISOString(),
      quality: { observedAt: new Date().toISOString(), ageSeconds: 5, freshness: "FRESH", source: "wallet_health_result" },
    };
    mockFetchSequence([
      { status: 200, body: { success: true, data: OPEN_MARKET, error: null, meta: {} } },
      { status: 200, body: BALANCE },
      { status: 200, body: EMPTY_POSITIONS },
      { status: 200, body: { success: true, data: { marketId: "market-1", items: [evidenceItem], generatedAt: new Date().toISOString() }, error: null, meta: {} } },
    ]);
    await renderDetail();

    await waitFor(() => expect(screen.getByText("Wallet age")).toBeInTheDocument());
    expect(screen.getByText(/this wallet has been active for 420 days/i)).toBeInTheDocument();
    expect(screen.getByText("info")).toBeInTheDocument();
    expect(screen.getByText(/confidence: high/i)).toBeInTheDocument();
    expect(screen.getByText(/source: wallet_health_result/i)).toBeInTheDocument();
    // Never phrases a factual item as a prediction claim.
    expect(screen.queryByText(/therefore/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/likely/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/recommended/i)).not.toBeInTheDocument();
  });
});
