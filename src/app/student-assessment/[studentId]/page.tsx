import { AppShell } from '@/components/app/app-shell';
import { PageHeader } from '@/components/app/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { initialStudents } from '@/lib/student-data';
import { notFound } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function StudentDetailPage({ params }: { params: { studentId: string } }) {
  const student = initialStudents.find((s) => s.id.toString() === params.studentId);

  if (!student) {
    notFound();
  }

  return (
    <AppShell>
      <div className="flex-1 space-y-8 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
            <PageHeader
            title={student.name}
            description={`Details and progress for ${student.name}.`}
            />
            <Button asChild variant="outline">
                <Link href="/student-assessment">
                    Back to Roster
                </Link>
            </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Teacher's Notes</CardTitle>
                        <CardDescription>Observations and notes about the student.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap">{student.notes || 'No notes have been added for this student yet.'}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>AI-Powered Suggestions</CardTitle>
                        <CardDescription>Get personalized suggestions for this student.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground space-y-4 min-h-[200px]">
                       <Sparkles className="h-12 w-12" />
                       <p>This feature is coming soon!</p>
                       <Button disabled>Generate Suggestions</Button>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Student Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Name:</span>
                            <span className="font-medium">{student.name}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Grade:</span>
                            <span className="font-medium">{student.grade}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </AppShell>
  );
}
