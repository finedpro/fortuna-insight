import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "../page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));

describe("HomePage (landing page) - soft-launch polish", () => {
  it("mentions Fortuna Markets, so a brand-new visitor isn't limited to Wallet Intelligence alone", () => {
    render(<HomePage />);
    expect(screen.getByText(/fortuna markets/i)).toBeInTheDocument();
  });

  it("the evidence-first philosophy line connects Wallet Intelligence and Markets", () => {
    render(<HomePage />);
    expect(screen.getByText(/see the evidence/i)).toBeInTheDocument();
  });

  it('"Launch App" is a real, working link to /dashboard - not a dead button', () => {
    render(<HomePage />);
    const links = screen.getAllByRole("link", { name: /launch app/i });
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link).toHaveAttribute("href", "/dashboard");
    }
  });

  it('there is a real, working link to Fortuna Markets on the landing page', () => {
    render(<HomePage />);
    const marketsLink = screen.getByRole("link", { name: /explore fortuna markets/i });
    expect(marketsLink).toHaveAttribute("href", "/markets");
  });

  it('never shows "Sign In" - there is no account/auth system to sign into', () => {
    render(<HomePage />);
    expect(screen.queryByText(/sign in/i)).not.toBeInTheDocument();
  });

  it('never shows the factually-wrong "No Predictions" badge now that Fortuna Markets exists', () => {
    render(<HomePage />);
    expect(screen.queryByText(/no predictions/i)).not.toBeInTheDocument();
  });

  it("the main marketing nav links to real, working pages only (no dead Features/Docs/Roadmap/Pricing links)", () => {
    render(<HomePage />);
    expect(screen.queryByRole("link", { name: /^features$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^docs$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^roadmap$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^pricing$/i })).not.toBeInTheDocument();
  });

  it("never implies financial promises, gambling, or AI-predicts-for-you messaging", () => {
    render(<HomePage />);
    const text = document.body.textContent?.toLowerCase() ?? "";
    expect(text).not.toContain("guaranteed");
    expect(text).not.toContain("profit");
    expect(text).not.toContain("bet ");
    expect(text).not.toContain("jackpot");
  });
});
