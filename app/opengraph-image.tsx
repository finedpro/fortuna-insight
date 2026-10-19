import { OG_SIZE, renderOgCard } from "@/lib/share/og-card";

export const alt = "Fortuna Insight — wallet intelligence for Solana";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard(null);
}
