import { AppShell } from '@/components/app/app-shell';
import { PageHeader } from '@/components/app/page-header';
import { ContentGenerationClient } from './_components/content-generation-client';

export default function ContentGenerationPage() {
  return (
    <AppShell>
      <div className="flex-1 space-y-8 p-4 pt-6 md:p-8">
        <PageHeader
          title="Content Generation"
          description="Create stories, examples, and explanations in local languages to make learning more relatable for your students."
        />
        <ContentGenerationClient />
      </div>
    </AppShell>
  );
}