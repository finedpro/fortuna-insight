"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { WalletInput } from "./wallet-input";
import { AnalyzeButton } from "./analyze-button";
import { ValidationMessage } from "./validation-message";
import { RecentWallets } from "./recent-wallets";
import type { WalletSearchStatus } from "../types";

const VALIDATION_MESSAGE_ID = "wallet-validation-message";

interface SearchCardProps {
  value: string;
  status: WalletSearchStatus;
  errorMessage?: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onDismissError: () => void;
}

export function SearchCard({
  value,
  status,
  errorMessage,
  onChange,
  onSubmit,
  onDismissError,
}: SearchCardProps) {
  return (
    <Card
      variant="elevated"
      className="flex w-full max-w-xl flex-col gap-4 p-6 motion-safe:animate-fade-in sm:p-8"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <WalletInput
          value={value}
          status={status}
          onChange={onChange}
          describedById={VALIDATION_MESSAGE_ID}
        />
        <AnalyzeButton status={status} onClick={onSubmit} />
      </form>

      <div id={VALIDATION_MESSAGE_ID} className="min-h-[1.5rem]">
        {status === "invalid" && (
          <ValidationMessage
            tone="invalid"
            message="That doesn't look like a valid wallet address."
          />
        )}
        {status === "valid" && (
          <ValidationMessage tone="valid" message="Looks good — ready to analyze." />
        )}
        {status === "error" && (
          <div className="flex items-center justify-between gap-3">
            <ValidationMessage
              tone="error"
              message={errorMessage ?? "Something went wrong. Please try again."}
            />
            <Button type="button" variant="ghost" size="sm" onClick={onDismissError}>
              Try again
            </Button>
          </div>
        )}
      </div>

      <Divider />
      <RecentWallets />
    </Card>
  );
}
