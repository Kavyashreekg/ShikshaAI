'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Student } from '@/lib/student-data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Pencil } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

const translations = {
  English: {
    editNotes: 'Edit Notes',
    updateNotesFor: (name: string) => `Update notes for ${name}`,
    notesDescription: 'Update the observations and notes for this student.',
    notesLabel: 'Notes',
    notesPlaceholder: 'Enter observations...',
    cancel: 'Cancel',
    save: 'Save',
    toastTitle: 'Notes Updated',
    toastDescription: (name: string) => `Notes for ${name} have been updated.`,
  },
  Hindi: {
    editNotes: 'नोट्स संपादित करें',
    updateNotesFor: (name: string) => `${name} के लिए नोट्स अपडेट करें`,
    notesDescription: 'इस छात्र के लिए अवलोकन और नोट्स अपडेट करें।',
    notesLabel: 'नोट्स',
    notesPlaceholder: 'अवलोकन दर्ज करें...',
    cancel: 'रद्द करें',
    save: 'सहेजें',
    toastTitle: 'नोट्स अपडेट किए गए',
    toastDescription: (name: string) => `${name} के लिए नोट्स अपडेट किए गए हैं।`,
  },
  Marathi: {
    editNotes: 'नोंदी संपादित करा',
    updateNotesFor: (name: string) => `${name} साठी नोंदी अद्यतनित करा`,
    notesDescription: 'या विद्यार्थ्यासाठी निरीक्षणे आणि नोंदी अद्यतनित करा.',
    notesLabel: 'नोंदी',
    notesPlaceholder: 'निरीक्षणे प्रविष्ट करा...',
    cancel: 'रद्द करा',
    save: 'जतन करा',
    toastTitle: 'नोंदी अद्यतनित केल्या',
    toastDescription: (name: string) => `${name} साठीच्या नोंदी अद्यतनित केल्या आहेत.`,
  },
};

interface EditNotesFormProps {
  student: Student;
  onUpdate: (student: Student) => void;
}

export function EditNotesForm({ student, onUpdate }: EditNotesFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();
  const typedLanguage = language as keyof typeof translations;
  const t = translations[typedLanguage] || translations['English'];

  const studentName = student.name[language] || student.name['English'];

  const formSchema = z.object({
    notes: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { notes: student.notes || '' },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const updatedStudent = {
      ...student,
      notes: values.notes,
    };

    onUpdate(updatedStudent);

    form.reset();
    setIsDialogOpen(false);
    toast({ title: t.toastTitle, description: t.toastDescription(studentName) });
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">{t.editNotes}</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.updateNotesFor(studentName)}</DialogTitle>
          <DialogDescription>{t.notesDescription}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.notesLabel}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t.notesPlaceholder} {...field} className="min-h-[120px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  {t.cancel}
                </Button>
              </DialogClose>
              <Button type="submit">{t.save}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
