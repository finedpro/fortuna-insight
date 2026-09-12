"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES, analysisDetailRoute } from "@/lib/constants";

/**
 * Retired as a separate implementation (Sprint 5 Task 1) — /analysis/[id]
 * is now the single canonical analysis-detail URL. This route exists
 * only to redirect old `/report?id=...` links there, so nothing links
 * to a dead end and no rendering logic is duplicated here.
 */
function ReportRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const analysisId = searchParams.get("id");

  useEffect(() => {
    router.replace(analysisId ? analysisDetailRoute(analysisId) : ROUTES.dashboard);
  }, [router, analysisId]);

  return null;
}

export default function ReportPage() {
  return (
    <Suspense fallback={null}>
      <ReportRedirect />
    </Suspense>
  );
}
