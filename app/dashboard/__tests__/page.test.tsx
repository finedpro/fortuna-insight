import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import DashboardPage from "../page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: vi.fn() }),
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

describe("DashboardPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the wallet search and an empty state when there are no recent analyses", async () => {
    mockFetchOnce(200, { success: true, data: { items: [], total: 0, limit: 5, offset: 0 }, error: null, meta: {} });

    render(<DashboardPage />);

    expect(screen.getByPlaceholderText(/wallet/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/no analyses yet/i)).toBeInTheDocument());
  });

  it("shows a Fortuna Markets intro card with a working CTA to /markets (launch polish - Product/UX audit)", async () => {
    mockFetchOnce(200, { success: true, data: { items: [], total: 0, limit: 5, offset: 0 }, error: null, meta: {} });

    render(<DashboardPage />);

    expect(screen.getByText("Fortuna Markets")).toBeInTheDocument();
    expect(screen.getByText(/virtual points/i)).toBeInTheDocument();
    const cta = screen.getByRole("link", { name: /explore markets/i });
    expect(cta).toHaveAttribute("href", "/markets");
    // Never implies financial returns or hype.
    expect(screen.queryByText(/guaranteed/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/profit/i)).not.toBeInTheDocument();
  });

  it("renders real recent analyses returned by the API", async () => {
    mockFetchOnce(200, {
      success: true,
      data: {
        items: [
          {
            id: "job-1",
            walletAddress: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
            network: "solana",
            status: "completed",
            stage: "completed",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
            healthScore: 91,
          },
        ],
        total: 1,
        limit: 5,
        offset: 0,
      },
      error: null,
      meta: {},
    });

    render(<DashboardPage />);

    await waitFor(() => expect(screen.getByText("91/100")).toBeInTheDocument());
    expect(screen.getByText(/view all/i)).toBeInTheDocument();
  });
});
