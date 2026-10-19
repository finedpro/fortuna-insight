import { ImageResponse } from "next/og";
import type { AnalysisSummary } from "./analysis-summary";

export const OG_SIZE = { width: 1200, height: 630 } as const;

const BACKGROUND = "#0c0c0f";
const GOLD = "#c2962e";
const FOREGROUND = "#f5f5f4";
const MUTED = "#a1a1aa";

/** The text shown on a card: pure and testable. Nothing here is a full wallet address. */
export function ogCardContent(summary: AnalysisSummary | null): { eyebrow: string; headline: string; detail: string; footer: string } {
  if (!summary) {
    return {
      eyebrow: "FORTUNA INSIGHT",
      headline: "Wallet intelligence for Solana",
      detail: "Evidence-based health score, holdings, staking and recent activity.",
      footer: "Analyze any wallet for free",
    };
  }
  const parts: string[] = [];
  if (summary.tokenCount !== null) parts.push(`${summary.tokenCount} tokens`);
  if (summary.transactionCount !== null) parts.push(`${summary.transactionCount} transactions`);
  return {
    eyebrow: "WALLET INTELLIGENCE REPORT",
    headline: `${summary.healthScore}/100`,
    detail: [summary.shortAddress, ...parts].join("  ·  "),
    footer: summary.confidence ? `Health score · ${summary.confidence} confidence` : "Health score",
  };
}

export function renderOgCard(summary: AnalysisSummary | null): ImageResponse {
  const content = ogCardContent(summary);
  const big = summary !== null;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BACKGROUND,
          padding: "64px 72px",
          borderLeft: `12px solid ${GOLD}`,
        }}
      >
        <div style={{ display: "flex", color: GOLD, fontSize: 28, letterSpacing: 6 }}>{content.eyebrow}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", color: FOREGROUND, fontSize: big ? 190 : 84, fontWeight: 700, lineHeight: 1.05 }}>
            {content.headline}
          </div>
          <div style={{ display: "flex", color: MUTED, fontSize: 36 }}>{content.detail}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", color: MUTED, fontSize: 28 }}>
          <span>{content.footer}</span>
          <span style={{ color: GOLD }}>Fortuna Insight</span>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
