import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { LANDING_NAV_ITEMS, ROUTES } from "@/lib/constants";

interface MobileMenuProps {
  id: string;
  open: boolean;
  onNavigate: () => void;
}

/**
 * Collapsible mobile nav panel. Open state is owned by SiteHeader; this
 * component only renders the transition + content so it stays presentational.
 */
export function MobileMenu({ id, open, onNavigate }: MobileMenuProps) {
  return (
    <div
      id={id}
      aria-hidden={!open}
      className={cn(
        "overflow-hidden border-b border-border bg-surface/95 backdrop-blur transition-[max-height,opacity] duration-300 ease-in-out md:hidden",
        open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
      )}
    >
      <nav aria-label="Mobile" className="flex flex-col gap-1 px-4 py-4">
        {LANDING_NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            tabIndex={open ? 0 : -1}
            onClick={onNavigate}
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}

        <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
          <Link
            href={ROUTES.dashboard}
            onClick={onNavigate}
            tabIndex={open ? 0 : -1}
            className={cn(buttonVariants({ variant: "gold" }), "w-full")}
          >
            Launch App
          </Link>
        </div>
      </nav>
    </div>
  );
}
