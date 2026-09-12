import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";
import type { WithChildren, WithClassName } from "@/types";

interface PageLayoutProps extends WithChildren, WithClassName {}

/**
 * Shared app shell: sidebar + header + scrollable content area.
 * All authenticated/dashboard-style routes should render inside this.
 */
export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background bg-gold-teal-glow">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className={cn("flex-1 px-4 py-8 md:px-8 md:py-10", className)}>
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
