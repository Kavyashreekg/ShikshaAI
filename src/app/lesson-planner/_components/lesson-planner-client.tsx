'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { grades, subjects } from '@/lib/data';
import { CalendarCheck } from 'lucide-react';

const formSchema = z.object({
  grade: z.string().min(1, 'Please select a grade.'),
  subject: z.string().min(1, 'Please select a subject.'),
  week: z.string().min(1, 'Please enter a week number or topic.'),
});

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

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: 'Feature Coming Soon',
      description: 'The AI Lesson Planner is under development. Please check back later!',
    });
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <Card className="lg:col-span-1">
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
