"use client";

import { useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { breakpoints } from "@/lib/design-system";
import type { WalletSearchStatus } from "../types";

interface WalletInputProps {
  value: string;
  status: WalletSearchStatus;
  onChange: (value: string) => void;
  describedById: string;
}

/**
 * Large, premium wallet address field. Autofocuses only on desktop
 * viewports — mobile users shouldn't get the keyboard shoved at them
 * the instant the page loads.
 */
export function WalletInput({
  value,
  status,
  onChange,
  describedById,
}: WalletInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const isDesktop = window.matchMedia(`(min-width: ${breakpoints.lg}px)`).matches;
    if (isDesktop) {
      inputRef.current?.focus();
    }
  }, []);

  const isInvalid = status === "invalid";

  return (
    <div className="relative flex-1">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        id="wallet-search-input"
        type="text"
        inputMode="text"
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste wallet address..."
        aria-label="Wallet address"
        aria-invalid={isInvalid || undefined}
        aria-describedby={describedById}
        className={cn(
          "h-14 w-full rounded-lg border bg-surface pl-11 pr-4 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          isInvalid
            ? "border-danger/50 focus-visible:ring-danger/60"
            : "border-border focus-visible:ring-gold/60",
        )}
      />
    </div>
  );
}
