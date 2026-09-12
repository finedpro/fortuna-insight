import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WatchlistPage from "../page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/watchlist",
}));

function mockFetchQueue(responses: Array<{ status: number; body: unknown }>) {
  const fn = vi.fn();
  for (const { status, body } of responses) {
    fn.mockResolvedValueOnce({ ok: status >= 200 && status < 300, status, json: async () => body } as Response);
  }
  vi.stubGlobal("fetch", fn);
  return fn;
}

const EMPTY_LIST = { success: true, data: { items: [], total: 0, limit: 50, offset: 0 }, error: null, meta: {} };
const EMPTY_EVENTS = { success: true, data: { items: [], total: 0, limit: 20, offset: 0 }, error: null, meta: {} };

describe("WatchlistPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the add-wallet form and empty states for both watchlist and activity", async () => {
    mockFetchQueue([
      { status: 200, body: EMPTY_LIST },
      { status: 200, body: EMPTY_EVENTS },
    ]);

    render(<WatchlistPage />);

    expect(screen.getByPlaceholderText(/solana wallet address/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/no wallets watched yet/i)).toBeInTheDocument());
    expect(screen.getByText(/no activity detected yet/i)).toBeInTheDocument();
  });

  it("adds a wallet via the form and shows it in the list after reload", async () => {
    const fn = mockFetchQueue([
      { status: 200, body: EMPTY_LIST },
      { status: 200, body: EMPTY_EVENTS },
      {
        status: 201,
        body: {
          success: true,
          data: {
            id: "w1",
            walletAddress: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
            network: "solana",
            label: null,
            watchRules: {},
            status: "active",
            lastCheckedAt: null,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
          error: null,
          meta: {},
        },
      },
      {
        status: 200,
        body: {
          success: true,
          data: {
            items: [
              {
                id: "w1",
                walletAddress: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
                network: "solana",
                label: null,
                watchRules: {},
                status: "active",
                lastCheckedAt: null,
                createdAt: "2026-01-01T00:00:00.000Z",
                updatedAt: "2026-01-01T00:00:00.000Z",
              },
            ],
            total: 1,
            limit: 50,
            offset: 0,
          },
          error: null,
          meta: {},
        },
      },
    ]);

    render(<WatchlistPage />);
    await waitFor(() => expect(screen.getByText(/no wallets watched yet/i)).toBeInTheDocument());

    const input = screen.getByPlaceholderText(/solana wallet address/i);
    await userEvent.type(input, "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM");
    await userEvent.click(screen.getByRole("button", { name: /add to watchlist/i }));

    await waitFor(() => expect(screen.getAllByText(/9WzDX/i).length).toBeGreaterThan(0));
    expect(fn).toHaveBeenCalledWith(
      "/api/watchlist",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("shows the real backend error message when adding a wallet fails", async () => {
    mockFetchQueue([
      { status: 200, body: EMPTY_LIST },
      { status: 200, body: EMPTY_EVENTS },
      {
        status: 422,
        body: { success: false, data: null, error: { code: "VALIDATION_FAILED", message: '"bad" is not a valid solana address.' }, meta: {} },
      },
    ]);

    render(<WatchlistPage />);
    await waitFor(() => expect(screen.getByText(/no wallets watched yet/i)).toBeInTheDocument());

    await userEvent.type(screen.getByPlaceholderText(/solana wallet address/i), "bad");
    await userEvent.click(screen.getByRole("button", { name: /add to watchlist/i }));

    await waitFor(() => expect(screen.getByText('"bad" is not a valid solana address.')).toBeInTheDocument());
  });

  it("renders watchlist API errors with a retry action", async () => {
    mockFetchQueue([
      { status: 500, body: { success: false, data: null, error: { code: "UNKNOWN_ERROR", message: "Backend unreachable" }, meta: {} } },
      { status: 200, body: EMPTY_EVENTS },
    ]);

    render(<WatchlistPage />);

    await waitFor(() => expect(screen.getByText(/could not load watchlist/i)).toBeInTheDocument());
    expect(screen.getByText("Backend unreachable")).toBeInTheDocument();
  });
});
