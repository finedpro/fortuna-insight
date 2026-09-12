import type { ReactNode } from "react";

/** Generic children-holding component props. */
export interface WithChildren {
  children: ReactNode;
}

/** Standard optional className prop, used across UI primitives. */
export interface WithClassName {
  className?: string;
}

export interface SectionProps extends WithChildren, WithClassName {
  id?: string;
  title?: string;
  eyebrow?: string;
  description?: string;
}
