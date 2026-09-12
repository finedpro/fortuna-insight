"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WalletSearchStatus } from "../types";

interface AnalyzeButtonProps {
  status: WalletSearchStatus;
  onClick: () => void;
}

/**
 * Wraps the shared Button primitive rather than reimplementing states —
 * idle/hover/disabled/loading all come from Button; this only adds the
 * temporary "success" checkmark treatment specific to this flow.
 */
export function AnalyzeButton({ status, onClick }: AnalyzeButtonProps) {
  const isLoading = status === "submitting" || status === "loading";
  const isSuccess = status === "success";
  const isReady = status === "valid";

  return (
    <Button
      type="button"
      variant="gold"
      size="lg"
      className="h-14 sm:w-auto"
      onClick={onClick}
      disabled={!isReady}
      isLoading={isLoading}
      aria-label={isSuccess ? "Wallet analyzed" : "Analyze wallet"}
    >
      {isSuccess ? (
        <>
          <Check className="h-4 w-4" aria-hidden="true" />
          Ready
        </>
      ) : (
        "Analyze"
      )}
    </Button>
  );
}
