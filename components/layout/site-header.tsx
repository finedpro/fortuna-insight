"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/common/container";
import { SiteNavigation } from "@/components/layout/site-navigation";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { SITE_CONFIG, ROUTES } from "@/lib/constants";

const MOBILE_MENU_ID = "site-mobile-menu";

/**
 * Sticky marketing site header. Transparent at the top of the page,
 * gains a hairline border + blur once the user scrolls.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-300",
        scrolled
          ? "border-border bg-background/80 backdrop-blur"
          : "border-transparent bg-transparent",
      )}
    >
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label={`${SITE_CONFIG.name} home`}
        >
          <span className="diamond" aria-hidden="true" />
          <span className="font-display text-base font-semibold tracking-tight text-foreground">
            {SITE_CONFIG.name}
          </span>
        </Link>

        <SiteNavigation />

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <Link href={ROUTES.dashboard} className={buttonVariants({ variant: "gold", size: "sm" })}>
              Launch App
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden"
            aria-expanded={mobileOpen}
            aria-controls={MOBILE_MENU_ID}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </Container>

      <MobileMenu
        id={MOBILE_MENU_ID}
        open={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
      />
    </header>
  );
}
