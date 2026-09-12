"use client";

import { useEffect, useRef } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Container } from "@/components/common/container";
import { Hero } from "@/components/common/hero";
import { trackEvent } from "@/lib/analytics";

/**
 * Sprint 3 Task 4 — dropped FeaturesPlaceholder/CtaPlaceholder from
 * this page. Both rendered literal "Section title placeholder" /
 * "CTA heading placeholder" text in dashed boxes — unfinished
 * scaffolding that would sit directly beneath the app's first real,
 * working feature and undermine exactly the "professional appearance"
 * this milestone asks for. Their component files are untouched, just
 * not used here.
 */
export default function HomePage() {
  const viewedRef = useRef(false);

  useEffect(() => {
    // Guarded against React Strict Mode's dev-only double-invoke of
    // effects (mount -> unmount -> mount again) - without this ref,
    // local `npm run dev` genuinely logs two landing_viewed rows per
    // visit (confirmed via live verification against real Supabase).
    // Production builds never double-invoke, but the guard costs
    // nothing and removes the ambiguity entirely either way.
    if (!viewedRef.current) {
      viewedRef.current = true;
      trackEvent("landing_viewed");
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <Container className="flex flex-col py-16 md:py-24">
          <Hero />
        </Container>
      </main>

      <SiteFooter />
    </div>
  );
}
