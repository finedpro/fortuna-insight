import { Fragment } from "react";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { cn } from "@/lib/utils";
import { typography } from "@/lib/design-system";
import type { FormattedAiReport } from "@/lib/api/types";

export interface AiReportCardProps {
  report: FormattedAiReport;
}

/**
 * Renders `report.content` verbatim — the AI Report Engine's markdown
 * output, split into lines and given light structural styling for
 * `## Heading` lines. No markdown library is added for this; the
 * report's own format is simple enough (headings + paragraphs) that a
 * few lines of line-by-line handling avoids a new dependency for one
 * screen.
 */
export function AiReportCard({ report }: AiReportCardProps) {
  const lines = report.content.split("\n");

  return (
    <DashboardCard title="AI Report">
      <div className="flex flex-col gap-2">
        {lines.map((line, index) => {
          const key = `${index}-${line.slice(0, 12)}`;
          if (line.startsWith("## ")) {
            return (
              <h4 key={key} className={cn(typography.h3.className, "mt-3 text-sm text-gold first:mt-0")}>
                {line.slice(3)}
              </h4>
            );
          }
          if (line.trim().length === 0) {
            return <Fragment key={key} />;
          }
          return (
            <p key={key} className="text-sm leading-relaxed text-foreground">
              {line}
            </p>
          );
        })}
      </div>
    </DashboardCard>
  );
}
