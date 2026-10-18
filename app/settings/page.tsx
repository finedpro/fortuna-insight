import { PageLayout } from "@/components/layout/page-layout";
import { Section } from "@/components/common/section";
import { SettingsView } from "@/features/settings/components/settings-view";

export default function SettingsPage() {
  return (
    <PageLayout>
      <Section
        eyebrow="Configuration"
        title="Settings"
        description="Display preferences for this browser, and what Fortuna stores."
        className="gap-6"
      >
        <SettingsView />
      </Section>
    </PageLayout>
  );
}
