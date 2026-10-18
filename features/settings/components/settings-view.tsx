"use client";

import { useSyncExternalStore } from "react";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { typography } from "@/lib/design-system";
import { peekOwnerKey, type TimeDisplay } from "@/lib/preferences";
import { usePreferences } from "../hooks/use-preferences";

const caption = cn(typography.caption.className, "text-muted-foreground");

const TIME_OPTIONS: ReadonlyArray<{ value: TimeDisplay; label: string }> = [
  { value: "utc", label: "UTC" },
  { value: "local", label: "My local time" },
];

const noopSubscribe = () => () => {};

function useBrowserId(): string | null {
  return useSyncExternalStore(noopSubscribe, peekOwnerKey, () => null);
}

/** Settings that are real today: browser-only display preferences, a read-only look at this browser's ID, and plain-language privacy information. */
export function SettingsView() {
  const { preferences, update, reset } = usePreferences();
  const browserId = useBrowserId();

  return (
    <div className="flex flex-col gap-6">
      <DashboardCard title="Display">
        <p className={caption}>
          These preferences are saved only in this browser. They are not tied to an account and are never sent to Fortuna.
        </p>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-foreground">Time display</legend>
          <div className="flex flex-wrap gap-4">
            {TIME_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="radio"
                  name="time-display"
                  value={option.value}
                  checked={preferences.timeDisplay === option.value}
                  onChange={() => update({ timeDisplay: option.value })}
                />
                {option.label}
              </label>
            ))}
          </div>
          <span className={caption}>Used for transaction times in wallet reports.</span>
        </fieldset>

        <label className="flex items-start gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            className="mt-1"
            checked={preferences.hideUnnamedTokens}
            onChange={(event) => update({ hideUnnamedTokens: event.target.checked })}
          />
          <span className="flex flex-col">
            Hide tokens without a name
            <span className={caption}>Tokens without a name are still counted and can be shown again at any time.</span>
          </span>
        </label>

        <div>
          <Button variant="outline" onClick={reset}>
            Reset preferences
          </Button>
        </div>
      </DashboardCard>

      <DashboardCard title="This browser">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-foreground">Browser ID (Markets and watchlist)</span>
          <span className="font-mono text-sm text-foreground">
            {browserId ? `${browserId.slice(0, 8)}…` : "Not created yet"}
          </span>
        </div>
        <p className={caption}>
          Fortuna has no accounts yet. Your watchlist and Fortuna Markets positions are linked to a random ID stored in this browser.
          If you clear this browser&apos;s site data or switch browsers, you lose access to them. This page only shows the ID; it cannot change it.
        </p>
      </DashboardCard>

      <DashboardCard title="Privacy">
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li className={caption}>
            Fortuna records anonymous usage events, such as which page or step was reached (for example: wallet analysis started,
            completed or failed), to learn where the product is confusing.
          </li>
          <li className={caption}>
            Events use a random ID stored in this browser. They do not contain wallet addresses, names or email addresses.
          </li>
          <li className={caption}>
            Wallet addresses you analyze are used to read public blockchain data. Fortuna Markets uses virtual points only, never real funds.
          </li>
        </ul>
      </DashboardCard>

      <DashboardCard title="Accounts and payments">
        <p className={caption}>
          Accounts, wallet connection and payments are not available yet. Nothing in Fortuna currently requires them.
        </p>
      </DashboardCard>
    </div>
  );
}
