import { AppShell } from '@/components/app/app-shell';
import { PageHeader } from '@/components/app/page-header';
import { KnowledgeBaseClient } from './_components/knowledge-base-client';

export default function KnowledgeBasePage() {
  return (
    <AppShell>
      <div className="flex-1 space-y-8 p-4 pt-6 md:p-8">
        <PageHeader
          title="Instant Knowledge Base"
          description="Get simple, accurate explanations for complex student questions, complete with easy-to-understand analogies."
        />
        <KnowledgeBaseClient />
      </div>
    </AppShell>
  );
}
