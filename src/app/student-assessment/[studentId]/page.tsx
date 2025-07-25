'use client';

import { useState } from 'react';
import { AppShell } from '@/components/app/app-shell';
import { PageHeader } from '@/components/app/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { initialStudents, Student } from '@/lib/student-data';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StudentSuggestions } from '../_components/student-suggestions';
import { EditStudentForm } from '../_components/edit-student-form';

export default function StudentDetailPage({ params }: { params: { studentId: string } }) {
  const initialStudent = initialStudents.find((s) => s.id.toString() === params.studentId);
  const [student, setStudent] = useState<Student | undefined>(initialStudent);

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
                    <ArrowLeft className="mr-2 h-4 w-4" />
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
                <StudentSuggestions student={student} />
            </div>
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Student Information</CardTitle>
                        <EditStudentForm student={student} setStudent={setStudent} />
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
                    {student.subjects && student.subjects.length > 0 && (
                        <>
                        <CardHeader className='pt-0'>
                            <CardTitle className="text-lg">Subject GPA</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Subject</TableHead>
                                        <TableHead className="text-right">GPA</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {student.subjects.map((item) => (
                                        <TableRow key={item.subject}>
                                            <TableCell>{item.subject}</TableCell>
                                            <TableCell className="text-right">{item.gpa.toFixed(1)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                        </>
                    )}
                </Card>
            </div>
        </div>
      </div>
    </AppShell>
  );
}
