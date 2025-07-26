'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';


import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { grades, languages } from '@/lib/data';
import { UserPlus, Trash2, Upload, Download } from 'lucide-react';
import { useStudent } from '@/context/student-context';
import { useLanguage } from '@/context/language-context';
import { translateText } from '@/ai/flows/translate-text';
import { Student } from '@/lib/student-data';


const translations = {
  English: {
    rosterTitle: 'Student Roster',
    rosterDescription: 'Manage your students and track their progress.',
    addStudent: 'Add Student',
    addNewStudent: 'Add New Student',
    newStudentDescription: 'Enter the details for the new student.',
    fullName: 'Full Name',
    namePlaceholder: 'e.g., Anika Gupta',
    grade: 'Grade',
    gradePlaceholder: 'Select a grade',
    initialNotes: 'Initial Notes',
    notesPlaceholder: 'Any initial observations...',
    cancel: 'Cancel',
    toastTitle: 'Student Added',
    toastDescription: (name: string) => `${name} has been added to your roster.`,
    tableName: 'Name',
    tableActions: 'Actions',
    details: 'Details',
    remove: 'Remove',
    removeStudentConfirmation: 'Are you sure?',
    removeStudentDescription: (name: string) => `This will permanently delete ${name} from your roster.`,
    toastStudentRemoved: 'Student Removed',
    noStudents: 'No students added yet.',
    translating: 'Translating...',
    formErrors: {
        nameMin: 'Name must be at least 2 characters.',
        gradeMin: 'Please select a grade.',
    },
    import: 'Import',
    export: 'Export',
    importing: 'Importing...',
    toastImportSuccess: 'Import Successful',
    toastImportSuccessDesc: (count: number) => `Successfully imported ${count} students.`,
    toastImportError: 'Import Failed',
    toastImportErrorDesc: 'Could not import students. Please check the file format and try again.',
  },
  Hindi: {
    rosterTitle: 'छात्र रोस्टर',
    rosterDescription: 'अपने छात्रों का प्रबंधन करें और उनकी प्रगति को ट्रैक करें।',
    addStudent: 'छात्र जोड़ें',
    addNewStudent: 'नया छात्र जोड़ें',
    newStudentDescription: 'नए छात्र के लिए विवरण दर्ज करें।',
    fullName: 'पूरा नाम',
    namePlaceholder: 'उदा., अनिका गुप्ता',
    grade: 'ग्रेड',
    gradePlaceholder: 'एक ग्रेड चुनें',
    initialNotes: 'प्रारंभिक नोट्स',
    notesPlaceholder: 'कोई प्रारंभिक अवलोकन...',
    cancel: 'रद्द करें',
    toastTitle: 'छात्र जोड़ा गया',
    toastDescription: (name: string) => `${name} को आपके रोस्टर में जोड़ा गया है।`,
    tableName: 'नाम',
    tableActions: 'कार्रवाइयाँ',
    details: 'विवरण',
    remove: 'हटाएं',
    removeStudentConfirmation: 'क्या आप निश्चित हैं?',
    removeStudentDescription: (name: string) => `यह ${name} को आपके रोस्टर से स्थायी रूप से हटा देगा।`,
    toastStudentRemoved: 'छात्र हटाया गया',
    noStudents: 'अभी तक कोई छात्र नहीं जोड़ा गया है।',
    translating: 'अनुवाद हो रहा है...',
    formErrors: {
        nameMin: 'नाम कम से कम 2 अक्षरों का होना चाहिए।',
        gradeMin: 'कृपया एक ग्रेड चुनें।',
    },
    import: 'आयात',
    export: 'निर्यात',
    importing: 'आयात हो रहा है...',
    toastImportSuccess: 'आयात सफल',
    toastImportSuccessDesc: (count: number) => `सफलतापूर्वक ${count} छात्रों का आयात किया गया।`,
    toastImportError: 'आयात विफल',
    toastImportErrorDesc: 'छात्रों का आयात नहीं हो सका। कृपया फ़ाइल प्रारूप की जाँच करें और पुनः प्रयास करें।',
  },
  Marathi: {
    rosterTitle: 'विद्यार्थी रोस्टर',
    rosterDescription: 'तुमच्या विद्यार्थ्यांचे व्यवस्थापन करा आणि त्यांच्या प्रगतीचा मागोवा घ्या.',
    addStudent: 'विद्यार्थी జోडा',
    addNewStudent: 'नवीन विद्यार्थी జోडा',
    newStudentDescription: 'नवीन विद्यार्थ्यांसाठी तपशील प्रविष्ट करा.',
    fullName: 'पूर्ण नाव',
    namePlaceholder: 'उदा., अनिका गुप्ता',
    grade: 'श्रेणी',
    gradePlaceholder: 'एक श्रेणी निवडा',
    initialNotes: 'प्रारंभिक नोंदी',
    notesPlaceholder: 'कोणतेही प्रारंभिक निरीक्षण...',
    cancel: 'रद्द करा',
    toastTitle: 'विद्यार्थी जोडला',
    toastDescription: (name: string) => `${name} तुमच्या रोस्टरमध्ये जोडला गेला आहे.`,
    tableName: 'नाव',
    tableActions: 'क्रिया',
    details: 'तपशील',
    remove: 'काढा',
    removeStudentConfirmation: 'तुम्ही नक्की आहात का?',
    removeStudentDescription: (name: string) => `हे ${name} ला तुमच्या रोस्टरमधून कायमचे काढून टाकेल.`,
    toastStudentRemoved: 'विद्यार्थी काढला',
    noStudents: 'अद्याप कोणीही विद्यार्थी जोडलेले नाहीत.',
    translating: 'भाषांतर होत आहे...',
    formErrors: {
        nameMin: 'नाव किमान २ अक्षरांचे असावे.',
        gradeMin: 'कृपया एक श्रेणी निवडा.',
    },
    import: 'आयात',
    export: 'निर्यात',
    importing: 'आयात करत आहे...',
    toastImportSuccess: 'आयात यशस्वी',
    toastImportSuccessDesc: (count: number) => `यशस्वीरित्या ${count} विद्यार्थी आयात केले.`,
    toastImportError: 'आयात अयशस्वी',
    toastImportErrorDesc: 'विद्यार्थी आयात करू शकलो नाही. कृपया फाइल स्वरूप तपासा आणि पुन्हा प्रयत्न करा.',
  },
};

export function StudentAssessmentClient() {
  const { students, addStudent, addStudents, removeStudent } = useStudent();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();
  const typedLanguage = language as keyof typeof translations;
  const t = translations[typedLanguage] || translations['English'];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formSchema = z.object({
    name: z.string().min(2, t.formErrors.nameMin),
    grade: z.string().min(1, t.formErrors.gradeMin),
    notes: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', grade: '', notes: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsTranslating(true);
    try {
      const languageCodes = languages.map(l => l.value);
      const { translations } = await translateText({
        text: values.name,
        targetLanguages: languageCodes,
      });

      translations['English'] = values.name;

      addStudent({ ...values, id: Date.now(), name: translations });
      form.reset();
      setIsDialogOpen(false);
      toast({ title: t.toastTitle, description: t.toastDescription(values.name) });
    } catch (error) {
        console.error("Translation failed:", error);
        const newNameRecord = languages.reduce((acc, lang) => {
            acc[lang.value] = values.name;
            return acc;
        }, {} as Record<string, string>);
        
        addStudent({ ...values, id: Date.now(), name: newNameRecord });
        toast({
            variant: 'destructive',
            title: 'Translation Failed',
            description: 'The student was added, but the name could not be translated. Please try again later.',
        });
    } finally {
        setIsTranslating(false);
        setIsDialogOpen(false);
    }
  }

  const handleRemoveStudent = (studentId: number, studentName: string) => {
    removeStudent(studentId);
    toast({ title: t.toastStudentRemoved, description: `${studentName} has been removed from your roster.` });
  };

  const handleExport = () => {
    const dataToExport = students.map(student => ({
      Name: student.name['English'] || '',
      Grade: student.grade,
      Notes: student.notes || '',
      ...(student.subjects || []).reduce((acc, subject) => {
        acc[`GPA - ${subject.subject}`] = subject.gpa;
        return acc;
      }, {} as Record<string, any>),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, 'student_roster.xlsx');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsImporting(true);
      const reader = new FileReader();
      
      const processData = async (data: any[]) => {
        try {
            const newStudents: Student[] = [];
            for (const row of data) {
                const name = row.Name || row.name;
                const grade = row.Grade || row.grade;
                if (name && grade) {
                    const languageCodes = languages.map(l => l.value);
                    const { translations } = await translateText({
                        text: name,
                        targetLanguages: languageCodes,
                    });
                    translations['English'] = name;
                    
                    newStudents.push({
                        id: Date.now() + Math.random(),
                        name: translations,
                        grade: String(grade),
                        notes: row.Notes || row.notes || '',
                        subjects: [],
                    });
                }
            }
            addStudents(newStudents);
            toast({ title: t.toastImportSuccess, description: t.toastImportSuccessDesc(newStudents.length) });
        } catch (error) {
            console.error("Import processing error:", error);
            toast({ variant: 'destructive', title: t.toastImportError, description: 'Error during translation step.' });
        } finally {
            setIsImporting(false);
        }
      };

      if (file.name.endsWith('.csv')) {
        reader.onload = (e) => {
            const csv = e.target?.result as string;
            Papa.parse(csv, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => processData(results.data),
            });
        };
        reader.readAsText(file);
      } else if (file.name.endsWith('.xlsx')) {
        reader.onload = (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
            processData(json);
        };
        reader.readAsArrayBuffer(file);
      } else {
        setIsImporting(false);
        toast({ variant: 'destructive', title: t.toastImportError, description: 'Unsupported file type.' });
      }
    }
  };


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t.rosterTitle}</CardTitle>
          <CardDescription>{t.rosterDescription}</CardDescription>
        </div>
        <div className="flex gap-2">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileSelect}
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
                <Upload className="mr-2 h-4 w-4" />
                {isImporting ? t.importing : t.import}
            </Button>
            <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                {t.export}
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {t.addStudent}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t.addNewStudent}</DialogTitle>
                  <DialogDescription>{t.newStudentDescription}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.fullName}</FormLabel>
                          <FormControl><Input placeholder={t.namePlaceholder} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="grade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.grade}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder={t.gradePlaceholder} /></SelectTrigger></FormControl>
                            <SelectContent>
                              {grades.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.initialNotes}</FormLabel>
                          <FormControl><Textarea placeholder={t.notesPlaceholder} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="ghost" disabled={isTranslating}>{t.cancel}</Button>
                      </DialogClose>
                      <Button type="submit" disabled={isTranslating}>
                        {isTranslating ? t.translating : t.addStudent}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.tableName}</TableHead>
                <TableHead className="w-[180px] text-right">{t.tableActions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length > 0 ? (
                students.map((student) => {
                  const studentName = student.name[language] || student.name['English'];
                  return (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {studentName}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                       <Button asChild variant="outline" size="sm">
                        <Link href={`/student-assessment/${student.id}`}>
                          {t.details}
                        </Link>
                      </Button>
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                              <span className="sr-only">{t.remove}</span>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t.removeStudentConfirmation}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t.removeStudentDescription(studentName)}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRemoveStudent(student.id, studentName)}>
                                {t.remove}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    {t.noStudents}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
