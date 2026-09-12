/**
 * Wallet address format validation — shape-checking only, per FC-004 scope.
 * This never calls a blockchain or verifies an address actually exists;
 * it only checks that the pasted text *looks like* a wallet address
 * (Solana-style base58 public key, 32–44 characters).
 */

const BASE58_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

/** Below this length we treat input as "still typing", not yet invalid. */
export const WALLET_TYPING_THRESHOLD = 6;

export type WalletValidationResult =
  { valid: true } | { valid: false; reason: "empty" | "invalid-format" };

export function validateWalletAddress(rawValue: string): WalletValidationResult {
  const value = rawValue.trim();
  if (value.length === 0) return { valid: false, reason: "empty" };
  return BASE58_ADDRESS_REGEX.test(value)
    ? { valid: true }
    : { valid: false, reason: "invalid-format" };
}

/**
 * Classifies raw input into the input-level states of the search state
 * machine. Submitting/loading/success/error are driven by the search flow
 * itself (see useWalletSearch), not by the input value.
 */
export function classifyWalletInput(
  value: string,
): "idle" | "typing" | "invalid" | "valid" {
  const trimmed = value.trim();
  if (trimmed.length === 0) return "idle";
  if (trimmed.length < WALLET_TYPING_THRESHOLD) return "typing";
  return validateWalletAddress(trimmed).valid ? "valid" : "invalid";
}
