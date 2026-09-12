import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import ReportPage from "../page";

const replaceMock = vi.fn();
let searchParamsValue = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => searchParamsValue,
}));

describe("ReportPage (retired — redirect shim only, Sprint 5 Task 1)", () => {
  beforeEach(() => {
    replaceMock.mockClear();
    searchParamsValue = new URLSearchParams();
  });

  it("redirects to the canonical /analysis/[id] URL when an id is present", async () => {
    searchParamsValue = new URLSearchParams({ id: "job-123" });

    render(<ReportPage />);

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/analysis/job-123"));
  });

  it("redirects to the dashboard when no id is present", async () => {
    render(<ReportPage />);

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/dashboard"));
  });
});
