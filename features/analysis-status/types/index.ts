import type { AnalysisCompletedData, AnalysisStatusData, ApiErrorBody } from "@/lib/api/types";

export type AnalysisStatusPhase =
  | "loading"
  | "in_progress"
  | "completed"
  | "failed"
  | "cancelled"
  | "not_found"
  | "error";

export interface AnalysisStatusState {
  phase: AnalysisStatusPhase;
  progress: AnalysisStatusData | null;
  result: AnalysisCompletedData | null;
  error: ApiErrorBody | null | undefined;
}
