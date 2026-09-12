import { Sparkles, Link2, ShieldCheck, UserCheck } from "lucide-react";

/**
 * Soft-launch polish - "No Predictions" was accurate when this badge
 * was written, before Fortuna Markets existed. It is now factually
 * wrong: Markets is literally a prediction feature (evidence-based,
 * virtual-only, but a prediction nonetheless). Replaced with the
 * principle that's actually still true across the whole product -
 * Fortuna itself never predicts an outcome FOR the user; the user
 * always makes that call themselves, in Wallet Intelligence and in
 * Markets alike.
 */
const TRUST_BADGES = [
  { label: "AI Powered", icon: Sparkles },
  { label: "Real On-Chain Data", icon: Link2 },
  { label: "Privacy First", icon: ShieldCheck },
  { label: "You Decide", icon: UserCheck },
] as const;

export function TrustBadges() {
  return (
    <ul
      aria-label="Platform highlights"
      className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
    >
      {TRUST_BADGES.map(({ label, icon: Icon }) => (
        <li key={label} className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}
