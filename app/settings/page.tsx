import { PageLayout } from "@/components/layout/page-layout";
import { Section } from "@/components/common/section";
import { PlaceholderPanel } from "@/components/common/placeholder-panel";

export default function SettingsPage() {
  return (
    <PageLayout>
      <Section
        eyebrow="Configuration"
        title="Settings"
        description="Account, wallet connections and preferences will be managed here."
        className="gap-6"
      >
        <PlaceholderPanel label="Settings coming soon" />
      </Section>
    </PageLayout>
  );
}
