import { AppShell } from '@/components/app/app-shell';
import { PageHeader } from '@/components/app/page-header';
import { LessonPlannerClient } from './_components/lesson-planner-client';

export default function LessonPlannerPage() {
  return (
    <AppShell>
      <div className="flex-1 space-y-8 p-4 pt-6 md:p-8">
        <PageHeader
          title="AI Lesson Planner"
          description="Generate AI-powered weekly lesson plans that structure activities and optimize your valuable time."
        />
        <LessonPlannerClient />
      </div>
    </AppShell>
  );
}
