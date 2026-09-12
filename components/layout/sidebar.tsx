"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, History, Eye, TrendingUp, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, SITE_CONFIG } from "@/lib/constants";

const ICONS: Record<string, React.ElementType> = {
  "/dashboard": LayoutDashboard,
  "/analyses": History,
  "/watchlist": Eye,
  "/markets": TrendingUp,
  "/settings": Settings,
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-surface md:flex md:flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <span className="diamond" aria-hidden="true" />
        <span className="font-display text-base font-semibold tracking-tight">
          {SITE_CONFIG.name}
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.href] ?? LayoutDashboard;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground",
                isActive && "bg-surface-elevated text-foreground",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
              {isActive && <span className="diamond ml-auto" aria-hidden="true" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4 font-mono text-xs text-muted-foreground">
        v0.1.0 · foundation
      </div>
    </aside>
  );
}
