import { describe, it, expect, vi, afterEach } from "vitest";
import { summarizeAnalysis, fetchAnalysisSummary, describeSummary, shortenAddress } from "../analysis-summary";
import { ogCardContent } from "../og-card";
import { getSiteUrl, DEFAULT_SITE_URL } from "../site-url";

const WALLET = "F3jWC4fiSNRExDLPBMCz1t3uCay7bC1PyrcbNSJWap2y";
const ID = "787245da-b44f-434d-adfc-74df864bfa50";

function body(overrides: Record<string, unknown> = {}) {
  return {
    success: true,
    data: {
      id: ID,
      status: "completed",
      result: {
        success: true,
        walletAddress: WALLET,
        network: "solana",
        healthResult: { healthScore: 95.6, confidence: "high" },
        walletSnapshot: { tokensTotal: 24, transactionCount: 543 },
        ...overrides,
      },
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("summarizeAnalysis", () => {
  it("keeps only preview-safe facts and shortens the wallet address", () => {
    const summary = summarizeAnalysis(body());
    expect(summary).toEqual({ network: "solana", shortAddress: "F3jW…Wap2y".replace("Wap2y", "ap2y"), healthScore: 96, confidence: "high", tokenCount: 24, transactionCount: 543 });
    expect(JSON.stringify(summary)).not.toContain(WALLET);
  });

  it("tolerates analyses stored before the snapshot existed", () => {
    expect(summarizeAnalysis(body({ walletSnapshot: undefined }))).toMatchObject({ tokenCount: null, transactionCount: null });
  });

  it("returns null for failed, unfinished or malformed analyses", () => {
    expect(summarizeAnalysis(body({ success: false }))).toBeNull();
    expect(summarizeAnalysis(body({ healthResult: null }))).toBeNull();
    expect(summarizeAnalysis({ data: { status: "running" } })).toBeNull();
    expect(summarizeAnalysis(null)).toBeNull();
    expect(summarizeAnalysis("nope")).toBeNull();
  });
});

describe("fetchAnalysisSummary", () => {
  it("rejects ids that are not UUIDs without calling the backend", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await fetchAnalysisSummary("../admin")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns a summary on success and null on backend errors or timeouts", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => body() }));
    expect((await fetchAnalysisSummary(ID))?.healthScore).toBe(96);

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }));
    expect(await fetchAnalysisSummary(ID)).toBeNull();

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new DOMException("timeout", "TimeoutError")));
    expect(await fetchAnalysisSummary(ID)).toBeNull();
  });
});

describe("preview text", () => {
  it("describes the report and omits unknown counts", () => {
    expect(describeSummary({ network: "solana", shortAddress: "x", healthScore: 90, confidence: "", tokenCount: 3, transactionCount: null })).toBe("Health score 90/100 · 3 tokens");
    expect(shortenAddress("short")).toBe("short");
  });

  it("builds a generic card without a summary and a data card with one", () => {
    expect(ogCardContent(null).headline).toMatch(/Solana/);
    const card = ogCardContent({ network: "solana", shortAddress: "F3jW…ap2y", healthScore: 96, confidence: "high", tokenCount: 24, transactionCount: 543 });
    expect(card.headline).toBe("96/100");
    expect(card.detail).toBe("F3jW…ap2y  ·  24 tokens  ·  543 transactions");
    expect(card.footer).toContain("high confidence");
  });
});

describe("getSiteUrl", () => {
  it("prefers an explicit setting, then Netlify's URL, then the default; always an origin", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.test/some/path");
    expect(getSiteUrl()).toBe("https://example.test");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("URL", "");
    expect(getSiteUrl()).toBe(DEFAULT_SITE_URL);
  });
});
