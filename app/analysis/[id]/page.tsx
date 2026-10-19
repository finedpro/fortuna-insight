import type { Metadata } from "next";
import { PageLayout } from "@/components/layout/page-layout";
import { AnalysisDetailView } from "@/features/analysis-status/components/analysis-detail-view";
import { describeSummary, fetchAnalysisSummary } from "@/lib/share/analysis-summary";

/**
 * The canonical URL for a single analysis (Sprint 5 Task 1) —
 * `/analysis/[id]`. Server component wrapper only: it awaits the
 * route's `id` param (Next.js 15 params are async) and hands it to the
 * client-side `AnalysisDetailView`, which owns 100% of the actual
 * polling/rendering logic. Nothing here duplicates that logic — this
 * file's whole job is unwrapping the route param (and, for link
 * previews, describing the report in metadata).
 */
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const summary = await fetchAnalysisSummary(id);

  const title = summary ? `Wallet report ${summary.shortAddress} — Fortuna Insight` : "Wallet Intelligence Report — Fortuna Insight";
  const description = summary
    ? describeSummary(summary)
    : "Evidence-based wallet intelligence for Solana: health score, holdings, staking and recent activity.";

  return {
    title,
    description,
    // Reports are shared by link only; keep them out of search engines. Link-preview crawlers still read the tags below.
    robots: { index: false, follow: false },
    openGraph: { title, description, type: "website", siteName: "Fortuna Insight" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function AnalysisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <PageLayout>
      <AnalysisDetailView analysisId={id} />
    </PageLayout>
  );
}
