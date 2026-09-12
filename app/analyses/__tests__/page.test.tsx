import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AnalysesPage from "../page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/analyses",
}));

function mockFetchOnce(status: number, body: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    } as Response),
  );
}

describe("AnalysesPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows a loading state, then the empty state when there is no history", async () => {
    mockFetchOnce(200, { success: true, data: { items: [], total: 0, limit: 10, offset: 0 }, error: null, meta: {} });

    render(<AnalysesPage />);

    expect(screen.getByText(/loading analyses/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/no analyses yet/i)).toBeInTheDocument());
  });

  it("shows an error state with a retry action on API failure", async () => {
    mockFetchOnce(500, {
      success: false,
      data: null,
      error: { code: "UNKNOWN_ERROR", message: "Backend unreachable" },
      meta: {},
    });

    render(<AnalysesPage />);

    await waitFor(() => expect(screen.getByText(/could not load analyses/i)).toBeInTheDocument());
    expect(screen.getByText("Backend unreachable")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("renders pagination controls reflecting total/limit/offset", async () => {
    mockFetchOnce(200, {
      success: true,
      data: {
        items: [
          {
            id: "job-1",
            walletAddress: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
            network: "solana",
            status: "failed",
            stage: "blockchain_processing",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
            healthScore: null,
          },
        ],
        total: 25,
        limit: 10,
        offset: 0,
      },
      error: null,
      meta: {},
    });

    render(<AnalysesPage />);

    await waitFor(() => expect(screen.getByText(/1-1 of 25/)).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /^next$/i })).toBeEnabled();
  });
});
