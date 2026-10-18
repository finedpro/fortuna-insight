import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SettingsView } from "../settings-view";
import { parsePreferences, DEFAULT_PREFERENCES } from "@/lib/preferences";

const OWNER_KEY = "3f2a91c4-1111-4222-8333-444455556666";

beforeEach(() => {
  localStorage.clear();
});

describe("SettingsView", () => {
  it("saves the time display choice to this browser", () => {
    render(<SettingsView />);
    fireEvent.click(screen.getByLabelText("My local time"));
    expect(JSON.parse(localStorage.getItem("fortuna-preferences") as string)).toMatchObject({ timeDisplay: "local" });
    expect(screen.getByLabelText("My local time")).toBeChecked();
  });

  it("saves the hide-unnamed-tokens choice and reset restores defaults", () => {
    render(<SettingsView />);
    fireEvent.click(screen.getByLabelText(/Hide tokens without a name/));
    expect(JSON.parse(localStorage.getItem("fortuna-preferences") as string)).toMatchObject({ hideUnnamedTokens: true });
    fireEvent.click(screen.getByRole("button", { name: "Reset preferences" }));
    expect(localStorage.getItem("fortuna-preferences")).toBeNull();
    expect(screen.getByLabelText("UTC")).toBeChecked();
    expect(screen.getByLabelText(/Hide tokens without a name/)).not.toBeChecked();
  });

  it("shows only a shortened browser ID and never creates or changes one", () => {
    const { unmount } = render(<SettingsView />);
    expect(screen.getByText("Not created yet")).toBeInTheDocument();
    expect(localStorage.getItem("fortuna-owner-key")).toBeNull();
    unmount();

    localStorage.setItem("fortuna-owner-key", OWNER_KEY);
    render(<SettingsView />);
    expect(screen.getByText("3f2a91c4…")).toBeInTheDocument();
    expect(screen.queryByText(OWNER_KEY)).toBeNull();
    expect(localStorage.getItem("fortuna-owner-key")).toBe(OWNER_KEY);
  });

  it("does not touch telemetry storage", () => {
    render(<SettingsView />);
    expect(localStorage.getItem("fortuna-analytics-session-id")).toBeNull();
  });

  it("has no fake account or wallet-connect controls", () => {
    render(<SettingsView />);
    expect(screen.getByText(/not available yet/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /connect|sign in|log in/i })).toBeNull();
  });
});

describe("parsePreferences", () => {
  it("accepts valid values and rejects anything else", () => {
    expect(parsePreferences(JSON.stringify({ timeDisplay: "local", hideUnnamedTokens: true }))).toEqual({ timeDisplay: "local", hideUnnamedTokens: true });
    expect(parsePreferences(JSON.stringify({ timeDisplay: "mars", hideUnnamedTokens: "yes" }))).toEqual(DEFAULT_PREFERENCES);
    expect(parsePreferences(null)).toEqual(DEFAULT_PREFERENCES);
    expect(parsePreferences("[1,2]")).toEqual(DEFAULT_PREFERENCES);
  });
});
