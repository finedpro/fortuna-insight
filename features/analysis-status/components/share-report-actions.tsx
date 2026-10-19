"use client";

import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { typography } from "@/lib/design-system";

const noopSubscribe = () => () => {};

function useCurrentUrl(): string {
  return useSyncExternalStore(
    noopSubscribe,
    () => window.location.href,
    () => "",
  );
}

export function buildShareText(healthScore: number | null): string {
  return healthScore === null
    ? "Wallet Intelligence report on Fortuna Insight"
    : `Wallet Intelligence report: health score ${healthScore}/100 on Fortuna Insight`;
}

export function xShareUrl(text: string, url: string): string {
  return `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

export function telegramShareUrl(text: string, url: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}

export interface ShareReportActionsProps {
  healthScore: number | null;
}

/** Share links only (copy, X, Telegram). Nothing is sent to Fortuna and no telemetry event is fired. The caption makes clear that anyone with the link can see the wallet address. */
export function ShareReportActions({ healthScore }: ShareReportActionsProps) {
  const url = useCurrentUrl();
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const text = buildShareText(healthScore);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    setTimeout(() => setCopyState("idle"), 2500);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={copyLink} disabled={!url}>
          {copyState === "copied" ? "Link copied" : copyState === "failed" ? "Copy failed - copy the address bar" : "Copy link"}
        </Button>
        <a
          href={url ? xShareUrl(text, url) : undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center rounded-md border border-border px-3 text-sm text-foreground hover:bg-surface-elevated/60"
        >
          Share on X
        </a>
        <a
          href={url ? telegramShareUrl(text, url) : undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center rounded-md border border-border px-3 text-sm text-foreground hover:bg-surface-elevated/60"
        >
          Share on Telegram
        </a>
      </div>
      <p className={cn(typography.caption.className, "text-muted-foreground")}>
        Anyone with this link can open the full report, including the wallet address.
      </p>
    </div>
  );
}
