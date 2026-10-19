import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ShareReportActions, buildShareText, xShareUrl, telegramShareUrl } from "../share-report-actions";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ShareReportActions", () => {
  it("offers copy, X and Telegram links built from the current page and warns that the link is public", () => {
    render(<ShareReportActions healthScore={96} />);
    const pageUrl = window.location.href;
    const x = screen.getByRole("link", { name: "Share on X" });
    expect(x.getAttribute("href")).toBe(xShareUrl(buildShareText(96), pageUrl));
    expect(x).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("link", { name: "Share on Telegram" }).getAttribute("href")).toBe(telegramShareUrl(buildShareText(96), pageUrl));
    expect(screen.getByText(/including the wallet address/)).toBeInTheDocument();
  });

  it("never puts the wallet address in the share text", () => {
    expect(buildShareText(96)).toBe("Wallet Intelligence report: health score 96/100 on Fortuna Insight");
    expect(buildShareText(null)).not.toMatch(/\//);
  });

  it("copies the link and confirms, or reports a failure", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<ShareReportActions healthScore={90} />);
    fireEvent.click(screen.getByRole("button", { name: "Copy link" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Link copied" })).toBeInTheDocument());
    expect(writeText).toHaveBeenCalledWith(window.location.href);
  });

  it("says so when the browser blocks copying", async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) } });
    render(<ShareReportActions healthScore={90} />);
    fireEvent.click(screen.getByRole("button", { name: "Copy link" }));
    await waitFor(() => expect(screen.getByRole("button", { name: /Copy failed/ })).toBeInTheDocument());
  });
});
