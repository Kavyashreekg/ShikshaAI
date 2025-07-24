import { AppShell } from '@/components/app/app-shell';
import { PageHeader } from '@/components/app/page-header';
import { StudentAssessmentClient } from './_components/student-assessment-client';

export default function StudentAssessmentPage() {
  return (
    <AppShell>
      <div className="flex-1 space-y-8 p-4 pt-6 md:p-8">
        <PageHeader
          title="Student Assessment"
          description="Track student progress, assess their improvement, and receive tailored suggestions for each student's development."
        />
        <StudentAssessmentClient />
      </div>
    </AppShell>
  );
}
