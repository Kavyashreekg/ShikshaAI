'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Student, SubjectPerformance } from '@/lib/student-data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Pencil } from 'lucide-react';

const formSchema = z.object({
  subject: z.string().min(2, 'Subject must be at least 2 characters.'),
  gpa: z.coerce.number().min(0, 'GPA must be non-negative.').max(5, 'GPA cannot exceed 5.0.'),
});

interface EditStudentFormProps {
  student: Student;
  setStudent: React.Dispatch<React.SetStateAction<Student | undefined>>;
}

export function EditStudentForm({ student, setStudent }: EditStudentFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { subject: '', gpa: 0 },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newSubject: SubjectPerformance = {
      subject: values.subject,
      gpa: values.gpa,
    };

    setStudent((prevStudent) => {
      if (!prevStudent) return undefined;
      
      const existingSubjects = prevStudent.subjects || [];
      
      return {
        ...prevStudent,
        subjects: [...existingSubjects, newSubject],
      };
    });

    form.reset();
    setIsDialogOpen(false);
    toast({ title: 'Subject Added', description: `${values.subject} has been added to ${student.name}'s records.` });
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit Student</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Subject for {student.name}</DialogTitle>
          <DialogDescription>Enter a new subject and the student's GPA.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Name</FormLabel>
                  <FormControl><Input placeholder="e.g., History" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gpa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GPA</FormLabel>
                  <FormControl><Input type="number" step="0.1" placeholder="e.g., 3.5" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">Cancel</Button>
              </DialogClose>
              <Button type="submit">Add Subject</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
