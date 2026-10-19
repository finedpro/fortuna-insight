import { fetchAnalysisSummary } from "@/lib/share/analysis-summary";
import { OG_SIZE, renderOgCard } from "@/lib/share/og-card";

export const alt = "Fortuna Insight wallet report";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return renderOgCard(await fetchAnalysisSummary(id));
}
