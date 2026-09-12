"use client";

import { useWalletSearch } from "../hooks/use-wallet-search";
import { SearchCard } from "./search-card";
import { LoadingCard } from "./loading-card";

/**
 * Entry point for the wallet search experience. Owns no UI of its own —
 * just wires the state machine (useWalletSearch) to whichever card the
 * current status calls for, so only one of the two is ever mounted.
 */
export function WalletSearch() {
  const { state, onChange, submit, reset, loadingSteps } = useWalletSearch();
  const isInFlight = state.status === "loading" || state.status === "success";

  if (isInFlight) {
    return (
      <LoadingCard
        key="loading"
        steps={loadingSteps}
        currentStepIndex={state.stepIndex}
        isComplete={state.status === "success"}
      />
    );
  }

  return (
    <SearchCard
      key="search"
      value={state.value}
      status={state.status}
      errorMessage={state.errorMessage}
      onChange={onChange}
      onSubmit={submit}
      onDismissError={reset}
    />
  );
}
