import { AppShell } from '@/components/app/app-shell';
import { PageHeader } from '@/components/app/page-header';
import { WorksheetClient } from './_components/worksheet-client';

export default function WorksheetsPage() {
  return (
    <AppShell>
      <div className="flex-1 space-y-8 p-4 pt-6 md:p-8">
        <PageHeader
          title="Differentiated Worksheets"
          description="Upload a photo of a textbook page to instantly generate worksheets tailored to different grade levels."
        />
        <WorksheetClient />
      </div>
    </AppShell>
  );
}
