import Link from "next/link";
import { WalletSearch } from "@/features/wallet-search";
import { TrustBadges } from "@/components/common/trust-badges";
import { ROUTES } from "@/lib/constants";

/**
 * Sprint 3 Task 4 — simplified from the earlier marketing-style hero
 * (two-column layout, decorative HeroMockup, "Launch App"/"View Demo"
 * buttons that led nowhere real). This is the actual first functional
 * screen: brand, one-line positioning, and the one real action the
 * product currently supports — analyzing a wallet through the real
 * API. Nothing here is decorative filler; every visible element is
 * either copy or the real WalletSearch flow.
 *
 * Soft-launch polish - added one line connecting Wallet Intelligence
 * to Fortuna Markets (previously invisible to a brand-new visitor;
 * Markets existed nowhere on this page at all). WalletSearch remains
 * the single dominant action - the Markets mention is deliberately
 * smaller/secondary, matching "Wallet Intelligence must remain the
 * primary product."
 */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 py-8 text-center"
    >
      <div className="flex flex-col items-center gap-3">
        <span className="font-display text-sm font-semibold uppercase tracking-[0.3em] text-gold motion-safe:animate-fade-up">
          Fortuna
        </span>
        <h1
          id="hero-heading"
          className="font-display text-3xl font-semibold leading-[1.15] tracking-tight text-foreground motion-safe:animate-fade-up motion-safe:[animation-delay:80ms] sm:text-4xl"
        >
          Blockchain Intelligence
        </h1>
        <p className="text-base text-muted-foreground motion-safe:animate-fade-up motion-safe:[animation-delay:160ms] sm:text-lg">
          Understand blockchain activity. See the evidence. Make your own decision.
        </p>
      </div>

      <div className="flex w-full justify-center motion-safe:animate-fade-up motion-safe:[animation-delay:240ms]">
        <WalletSearch />
      </div>

      <p className="text-sm text-muted-foreground motion-safe:animate-fade-up motion-safe:[animation-delay:280ms]">
        Curious how the same evidence applies to a question with a YES/NO answer?{" "}
        <Link href={ROUTES.markets} className="font-medium text-gold hover:underline">
          Explore Fortuna Markets
        </Link>
        .
      </p>

      <div className="motion-safe:animate-fade-up motion-safe:[animation-delay:320ms]">
        <TrustBadges />
      </div>
    </section>
  );
}
