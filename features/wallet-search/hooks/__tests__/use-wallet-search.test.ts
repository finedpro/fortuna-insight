import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useWalletSearch } from "../use-wallet-search";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const VALID_ADDRESS = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";

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

describe("useWalletSearch", () => {
  beforeEach(() => {
    pushMock.mockClear();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("classifies input as the user types", () => {
    const { result } = renderHook(() => useWalletSearch());

    act(() => result.current.onChange("abc"));
    expect(result.current.state.status).toBe("typing");

    act(() => result.current.onChange(VALID_ADDRESS));
    expect(result.current.state.status).toBe("valid");

    act(() => result.current.onChange("not-a-valid-address-at-all!!"));
    expect(result.current.state.status).toBe("invalid");
  });

  it("does nothing on submit unless the input is valid", () => {
    const { result } = renderHook(() => useWalletSearch());
    act(() => result.current.onChange("short"));

    act(() => result.current.submit());

    expect(result.current.state.status).toBe("typing");
  });

  it("submits a valid wallet, shows a loading state, and navigates to the report page on success", async () => {
    mockFetchOnce(202, {
      success: true,
      data: { id: "job-123", status: "queued", stage: "queued" },
      error: null,
      meta: { requestId: "r1", timestamp: "now" },
    });

    const { result } = renderHook(() => useWalletSearch());
    act(() => result.current.onChange(VALID_ADDRESS));
    expect(result.current.state.status).toBe("valid");

    act(() => result.current.submit());

    // Loading state is entered synchronously before the fetch resolves.
    expect(["submitting", "loading"]).toContain(result.current.state.status);

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/analysis/job-123"));
    expect(fetch).toHaveBeenCalledWith(
      "/api/analyze",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ network: "solana", walletAddress: VALID_ADDRESS }),
      }),
    );
  });

  it("shows the real backend error message and does not navigate when the API call fails", async () => {
    mockFetchOnce(400, {
      success: false,
      data: null,
      error: { code: "BAD_REQUEST", message: '"walletAddress" is required and must be a non-empty string.' },
      meta: { requestId: "r1", timestamp: "now" },
    });

    const { result } = renderHook(() => useWalletSearch());
    act(() => result.current.onChange(VALID_ADDRESS));
    act(() => result.current.submit());

    await waitFor(() => expect(result.current.state.status).toBe("error"));
    expect(result.current.state.errorMessage).toBe(
      '"walletAddress" is required and must be a non-empty string.',
    );
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("shows an error state on a network failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));

    const { result } = renderHook(() => useWalletSearch());
    act(() => result.current.onChange(VALID_ADDRESS));
    act(() => result.current.submit());

    await waitFor(() => expect(result.current.state.status).toBe("error"));
    expect(pushMock).not.toHaveBeenCalled();
  });
});
