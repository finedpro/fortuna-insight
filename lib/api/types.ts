/**
 * Hand-mirrored from the real backend response shapes (verified
 * directly against backend/api/analysis/analysis-api.types.ts,
 * backend/application/analysis-orchestrator/analysis-orchestrator.types.ts,
 * backend/intelligence/wallet-health/wallet-health.types.ts,
 * backend/intelligence/evidence/evidence.types.ts, and
 * backend/ai/report-v1/ai-report.types.ts). Every field name here
 * matches what the API actually returns — nothing invented, nothing
 * added "for completeness."
 */

export type NetworkId = "solana" | "ethereum" | "base" | "polygon" | "arbitrum" | "bitcoin";

export type JobStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export type JobStage =
  | "validation"
  | "queued"
  | "blockchain_processing"
  | "scoring_engine"
  | "ai_summary_generation"
  | "completed";

export type ConfidenceLevel = "high" | "medium" | "low";

export type FactorDirection = "positive" | "negative" | "neutral";

export interface WalletHealthFactorContribution {
  factor: string;
  score: number;
  weight: number;
  direction: FactorDirection;
  explanation: string;
}

export interface WalletHealthWarning {
  factor: string;
  message: string;
}

export interface WalletHealthResult {
  healthScore: number;
  contributingFactors: WalletHealthFactorContribution[];
  warnings: WalletHealthWarning[];
  confidence: ConfidenceLevel;
  metadata: {
    calculatedAt: string;
    engineVersion: string;
    factorsEvaluated: number;
    factorsWithSufficientData: number;
  };
}

export type EvidenceCategory =
  | "wallet_age"
  | "activity"
  | "portfolio"
  | "risk"
  | "usage"
  | "assets"
  | "behaviour";

export type EvidenceSeverity = "info" | "notice" | "warning" | "critical";

export interface Evidence {
  id: string;
  category: EvidenceCategory;
  title: string;
  description: string;
  severity: EvidenceSeverity;
  confidence: ConfidenceLevel;
  source: string;
  timestamp: string;
}

export interface EvidenceCollection {
  walletAddress: string;
  network: NetworkId;
  items: Evidence[];
  generatedAt: string;
}

export interface FormattedAiReport {
  format: "markdown" | "json" | "plain_text";
  content: string;
}

export interface WalletValidationError {
  code: string;
  message: string;
}

export interface WalletValidationResult {
  isValid: boolean;
  network: NetworkId;
  walletAddress: string;
  errors: WalletValidationError[];
  warnings: { code: string; message: string }[];
}

export interface AnalysisResultMetadata {
  startedAt: string;
  completedAt: string;
  durationMs: number;
}

export interface AnalysisResult {
  success: boolean;
  walletAddress: string;
  network: NetworkId;
  validation: WalletValidationResult;
  healthResult: WalletHealthResult | null;
  evidenceCollection: EvidenceCollection | null;
  report: FormattedAiReport | null;
  metadata: AnalysisResultMetadata;
}

/** POST /api/v1/analyze success body (202). */
export interface JobAcceptedData {
  id: string;
  status: JobStatus;
  stage: JobStage;
}

/** GET /api/v1/analysis/{id} success body while queued/running. */
export interface AnalysisStatusData {
  id: string;
  status: "queued" | "running";
  stage: JobStage;
  updatedAt: string;
}

/** GET /api/v1/analysis/{id} success body once completed. */
export interface AnalysisCompletedData {
  id: string;
  status: "completed";
  stage: "completed";
  result: AnalysisResult;
}

/**
 * Sprint 5 Task 1 — one row of `GET /api/v1/analyses`. Mirrors the
 * backend's `AnalysisListItemData` exactly. `healthScore` is `null`
 * whenever the analysis isn't completed yet — never a placeholder.
 */
export interface AnalysisListItem {
  id: string;
  walletAddress: string;
  network: NetworkId;
  status: JobStatus;
  stage: JobStage;
  createdAt: string;
  updatedAt: string;
  healthScore: number | null;
}

export interface AnalysisListResponse {
  items: AnalysisListItem[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Sprint 6 Task 1 (Fortuna Monitor). Mirrors the backend's
 * monitor-api.types.ts exactly - field names match GET/POST
 * /api/v1/watchlist and GET /api/v1/monitor/events verbatim.
 */
export type WatchRuleKey =
  | "tokenPurchases"
  | "tokenSales"
  | "largeTransactions"
  | "newTokens"
  | "balanceChanges"
  | "allTransactions";

export type WatchedWalletStatus = "active" | "paused";

export type MonitorEventType =
  | "tokenPurchase"
  | "tokenSale"
  | "largeTransaction"
  | "newTokenInteraction"
  | "balanceChange"
  | "solTransfer";

export interface WatchedWallet {
  id: string;
  walletAddress: string;
  network: NetworkId;
  label: string | null;
  watchRules: Record<WatchRuleKey, boolean>;
  status: WatchedWalletStatus;
  lastCheckedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WatchlistResponse {
  items: WatchedWallet[];
  total: number;
  limit: number;
  offset: number;
}

export interface MonitorEventPayload {
  amount: string | null;
  mint: string | null;
  counterparty: string | null;
  direction: string;
}

export interface MonitorEvent {
  id: string;
  watchedWalletId: string;
  walletAddress: string | null;
  walletLabel: string | null;
  network: NetworkId;
  eventType: MonitorEventType;
  signature: string;
  payload: MonitorEventPayload;
  blockchainTimestamp: string | null;
  slot: number | null;
  detectedAt: string;
}

export interface MonitorEventsResponse {
  items: MonitorEvent[];
  total: number;
  limit: number;
  offset: number;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: ApiErrorBody | null;
  meta: { requestId: string; timestamp: string };
}

/**
 * Fortuna Markets Sprint 1. Mirrors the backend's
 * api/markets/market-api.types.ts exactly - field names match
 * verbatim. `impliedProbabilityYes` is a pool-ratio artifact, NOT a
 * prediction - deliberately named to never collide with a future AI
 * probability field. Never rename it, and never introduce
 * `aiProbability`/`predictedProbability`/`probability`/`odds`.
 */
export type MarketStatus = "OPEN" | "RESOLVED";
export type MarketOutcome = "YES" | "NO";
export type PositionStatus = "pending" | "settled";

/**
 * Fortuna Markets Sprint 3. Deterministic, explicit, never inferred
 * from `Market.question` - the backend never guesses this from
 * free-text, and neither should any frontend code.
 */
export type MarketSubjectType = "ASSET" | "WALLET" | "NETWORK" | "UNKNOWN";

export interface MarketSubject {
  type: MarketSubjectType;
  reference: string;
}

export interface Market {
  id: string;
  question: string;
  subject: MarketSubject;
  status: MarketStatus;
  closesAt: string;
  resolvedOutcome: MarketOutcome | null;
  totalYesStake: number;
  totalNoStake: number;
  impliedProbabilityYes: number | null;
  createdAt: string;
  resolvedAt: string | null;
  updatedAt: string;
}

export interface Position {
  id: string;
  marketId: string;
  /** Launch polish - the market's own question, so the UI never has to show a raw marketId. Null only if the market genuinely could not be found. */
  marketQuestion: string | null;
  ownerKey: string;
  outcome: MarketOutcome;
  stake: number;
  status: PositionStatus;
  payout: number | null;
  createdAt: string;
  settledAt: string | null;
}

export interface VirtualBalance {
  ownerKey: string;
  balance: number;
}

export interface MarketsListResponse {
  items: Market[];
  limit: number;
  offset: number;
}

export interface PositionsListResponse {
  items: Position[];
  limit: number;
  offset: number;
}

/**
 * Fortuna Markets Sprint 2. Deliberately NOT the same shape as
 * `Evidence`/`EvidenceCollection` above (those are scoped to one
 * wallet, produced by the existing Evidence Engine as part of a
 * wallet analysis) - a Market's question has no wallet to be about,
 * so there is no legitimate relationship yet connecting an arbitrary
 * market to any wallet's evidence. `items` is honestly `[]` for every
 * market right now - this is the correct backend behavior, not a
 * frontend bug to work around.
 */
/** Fortuna Markets Sprint 6 - "Evidence Quality & Freshness Layer". `observedAt` (when the fact was true) is distinct from the evidence item's own `timestamp` field only in name here - both refer to the same underlying moment; `MarketEvidenceContext.generatedAt` (when the response was assembled) is the one that differs. */
export type EvidenceFreshness = "FRESH" | "STALE" | "UNKNOWN";

export interface EvidenceQuality {
  observedAt: string | null;
  ageSeconds: number | null;
  freshness: EvidenceFreshness;
  source: string;
}

export interface MarketEvidenceItem {
  id: string;
  category: string;
  title: string;
  description: string;
  severity: string;
  confidence: string;
  source: string;
  timestamp: string;
  quality: EvidenceQuality;
}

export interface MarketEvidenceResponse {
  marketId: string;
  subject: MarketSubject;
  items: MarketEvidenceItem[];
  generatedAt: string;
}
