import { Section } from "@/components/common/section";
import { PlaceholderPanel } from "@/components/common/placeholder-panel";

/**
 * Layout-only placeholder for the landing features section.
 * FC-002A scope: structure only — real feature content/design lands later.
 */
export function FeaturesPlaceholder() {
  return (
    <Section
      id="features"
      eyebrow="Features"
      title="Section title placeholder"
      className="gap-8"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <PlaceholderPanel label="Feature card placeholder" />
        <PlaceholderPanel label="Feature card placeholder" />
        <PlaceholderPanel label="Feature card placeholder" />
      </div>
    </Section>
  );
}
