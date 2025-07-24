'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { grades, subjects } from '@/lib/data';
import { CalendarCheck, BookOpen } from 'lucide-react';

const formSchema = z.object({
  grade: z.string().min(1, 'Please select a grade.'),
  subject: z.string().min(1, 'Please select a subject.'),
  week: z.string().min(1, 'Please enter a week number or topic.'),
});

function TextbookLink({ grade, subject }: { grade: string, subject: string }) {
  const [ncertLink, setNcertLink] = useState('https://ncert.nic.in/textbook.php');

  useEffect(() => {
    if (grade && subject) {
      // This is a simplified example. A full implementation would require a mapping
      // of grades and subjects to the specific NCERT book codes (e.g., 'aemr1').
      const baseUrl = 'https://ncert.nic.in/textbook.php';
      const gradeLabel = grades.find(g => g.value === grade)?.label;
      const subjectLabel = subjects.find(s => s.value === subject)?.label;
      // A real implementation would need a more robust query builder.
      // For now, we link to the main textbook page as a fallback.
      setNcertLink(baseUrl);
    }
  }, [grade, subject]);

  if (!grade || !subject) {
    return (
       <Link href="https://ncert.nic.in/textbook.php" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="w-full">
            <BookOpen className="mr-2 h-4 w-4" />
            Go to NCERT Portal
          </Button>
        </Link>
    );
  }
  
  const gradeLabel = grades.find(g => g.value === grade)?.label;
  const subjectLabel = subjects.find(s => s.value === subject)?.label;

  return (
    <div className="text-center space-y-2">
      <p className="text-sm text-muted-foreground">
        Find resources for <span className="font-semibold">{gradeLabel}, {subjectLabel}</span>.
      </p>
      <Link href={ncertLink} target="_blank" rel="noopener noreferrer">
        <Button variant="outline" className="w-full">
          <BookOpen className="mr-2 h-4 w-4" />
          Search NCERT Portal
        </Button>
      </Link>
    </div>
  );
}


export function LessonPlannerClient() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grade: '',
      subject: '',
      week: '',
    },
  });

  const watchedGrade = useWatch({ control: form.control, name: 'grade' });
  const watchedSubject = useWatch({ control: form.control, name: 'subject' });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: 'Feature Coming Soon',
      description: 'The AI Lesson Planner is under development. Please check back later!',
    });
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1 flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Lesson Plan Details</CardTitle>
            <CardDescription>Specify the details for your weekly plan.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a grade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {grades.map((grade) => (
                            <SelectItem key={grade.value} value={grade.value}>
                              {grade.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.value} value={subject.value}>
                              {subject.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="week"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Week / Topic</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Week 5 or 'Introduction to Fractions'" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Generate Plan
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Textbook Resources</CardTitle>
            <CardDescription>Access official NCERT textbooks directly.</CardDescription>
          </CardHeader>
          <CardContent>
            <TextbookLink grade={watchedGrade} subject={watchedSubject} />
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle>Generated Lesson Plan</CardTitle>
            <CardDescription>Your weekly plan will be structured here.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 flex-col items-center justify-center text-center text-muted-foreground">
              <CalendarCheck className="h-16 w-16 mb-4" />
              <h3 className="text-xl font-semibold">Lesson Planner Coming Soon</h3>
              <p>This feature is currently under development.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
