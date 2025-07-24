import { AppShell } from '@/components/app/app-shell';
import { PageHeader } from '@/components/app/page-header';
import { VisualAidClient } from './_components/visual-aid-client';

export default function VisualAidsPage() {
  return (
    <AppShell>
      <div className="flex-1 space-y-8 p-4 pt-6 md:p-8">
        <PageHeader
          title="Visual Aid Designer"
          description="Generate simple line drawings or charts from a description, perfect for replicating on a blackboard."
        />
        <VisualAidClient />
      </div>
    </AppShell>
  );
}
