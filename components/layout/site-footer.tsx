import Link from "next/link";
import { Github, Twitter, Send } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/common/container";
import { LANDING_NAV_ITEMS, SITE_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SOCIAL_LINKS = [
  { label: "GitHub", href: "#", icon: Github },
  { label: "Twitter", href: "#", icon: Twitter },
  { label: "Telegram", href: "#", icon: Send },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <Container className="flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-3">
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
          <p className="font-mono text-xs text-muted-foreground">
            © {year} {SITE_CONFIG.name}. All rights reserved.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          {LANDING_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              aria-label={label}
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </Container>
    </footer>
  );
}
