
'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { grades, subjects } from '@/lib/data';
import { CalendarCheck, BookOpen, UploadCloud, Layers, ShieldAlert, XCircle, FileDown } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { generateLessonPlan, GenerateLessonPlanOutput } from '@/ai/flows/generate-lesson-plan';


const translations = {
  English: {
    lessonPlanDetails: 'Lesson Plan Details',
    specifyDetails: 'Specify the details for your weekly plan.',
    grade: 'Grade',
    selectGrade: 'Select a grade',
    subject: 'Subject',
    selectSubject: 'Select a subject',
    lessonName: 'Lesson Topic',
    lessonNamePlaceholder: "e.g., 'Introduction to Fractions'",
    generatePlan: 'Generate Plan',
    generatingPlan: 'Generating Plan...',
    textbookResources: 'Textbook Resources',
    accessNCERT: 'Access official NCERT textbooks directly.',
    findResourcesFor: (grade: string, subject: string) => `Find resources for ${grade}, ${subject}.`,
    searchNCERT: 'Search NCERT Portal',
    goToNCERT: 'Go to NCERT Portal',
    generatedLessonPlan: 'Generated Lesson Plan',
    planWillBeStructured: 'Your weekly plan will be structured here.',
    emptyState: 'Provide details to generate your lesson plan.',
    clearButton: 'Clear',
    contentBlockedTitle: 'Content Blocked',
    safetyError: 'The generated lesson plan was blocked for safety reasons. Please try a different topic.',
    errorTitle: 'An error occurred.',
    errorDescription: 'Failed to generate the lesson plan. Please try again.',
    formErrors: {
      grade: 'Please select a grade.',
      subject: 'Please select a subject.',
      lessonName: 'Please enter a lesson topic.',
    },
    downloadPdf: 'Download PDF',
    downloading: 'Downloading...',
  },
  Hindi: {
    lessonPlanDetails: 'पाठ योजना विवरण',
    specifyDetails: 'अपनी साप्ताहिक योजना के लिए विवरण निर्दिष्ट करें।',
    grade: 'ग्रेड',
    selectGrade: 'एक ग्रेड चुनें',
    subject: 'विषय',
    selectSubject: 'एक विषय चुनें',
    lessonName: 'पाठ का विषय',
    lessonNamePlaceholder: "जैसे, 'भिन्न का परिचय'",
    generatePlan: 'योजना बनाएं',
    generatingPlan: 'योजना बन रही है...',
    textbookResources: 'पाठ्यपुस्तक संसाधन',
    accessNCERT: 'आधिकारिक एनसीईआरटी पाठ्यपुस्तकें सीधे एक्सेस करें।',
    findResourcesFor: (grade: string, subject: string) => `${grade}, ${subject} के लिए संसाधन खोजें।`,
    searchNCERT: 'एनसीईआरटी पोर्टल खोजें',
    goToNCERT: 'एनसीईआरटी पोर्टल पर जाएं',
    generatedLessonPlan: 'उत्पन्न पाठ योजना',
    planWillBeStructured: 'आपकी साप्ताहिक योजना यहाँ संरचित की जाएगी।',
    emptyState: 'अपनी पाठ योजना बनाने के लिए विवरण प्रदान करें।',
    clearButton: 'साफ़ करें',
    contentBlockedTitle: 'सामग्री अवरुद्ध',
    safetyError: 'सुरक्षा कारणों से उत्पन्न पाठ योजना को अवरुद्ध कर दिया गया था। कृपया एक अलग विषय का प्रयास करें।',
    errorTitle: 'एक त्रुटि हुई।',
    errorDescription: 'पाठ योजना बनाने में विफल। कृपया पुनः प्रयास करें।',
    formErrors: {
      grade: 'कृपया एक ग्रेड चुनें।',
      subject: 'कृपया एक विषय चुनें।',
      lessonName: 'कृपया पाठ का विषय दर्ज करें।',
    },
    downloadPdf: 'पीडीएफ डाउनलोड करें',
    downloading: 'डाउनलोड हो रहा है...',
  },
  Marathi: {
    lessonPlanDetails: 'पाठ योजना तपशील',
    specifyDetails: 'तुमच्या साप्ताहिक योजनेसाठी तपशील निर्दिष्ट करा.',
    grade: 'श्रेणी',
    selectGrade: 'एक श्रेणी निवडा',
    subject: 'विषय',
    selectSubject: 'एक विषय निवडा',
    lessonName: 'पाठाचा विषय',
    lessonNamePlaceholder: "उदा., 'अपूर्णांकांची ओळख'",
    generatePlan: 'योजना तयार करा',
    generatingPlan: 'योजना तयार होत आहे...',
    textbookResources: 'पाठ्यपुस्तक संसाधने',
    accessNCERT: 'अधिकृत एनसीईआरटी पाठ्यपुस्तके थेट मिळवा.',
    findResourcesFor: (grade: string, subject: string) => `${grade}, ${subject} साठी संसाधने शोधा.`,
    searchNCERT: 'एनसीईआरटी पोर्टल शोधा',
    goToNCERT: 'एनसीईआरटी पोर्टलवर जा',
    generatedLessonPlan: 'तयार केलेली पाठ योजना',
    planWillBeStructured: 'तुमची साप्ताहिक योजना येथे संरचित केली जाईल.',
    emptyState: 'तुमची पाठ योजना तयार करण्यासाठी तपशील द्या.',
    clearButton: 'साफ करा',
    contentBlockedTitle: 'सामग्री अवरोधित',
    safetyError: 'सुरक्षेच्या कारणास्तव तयार केलेली पाठ योजना अवरोधित केली गेली. कृपया वेगळा विषय वापरून पहा.',
    errorTitle: 'एक त्रुटी आली.',
    errorDescription: 'पाठ योजना तयार करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
    formErrors: {
      grade: 'कृपया एक श्रेणी निवडा.',
      subject: 'कृपया एक विषय निवडा.',
      lessonName: 'कृपया पाठाचा विषय प्रविष्ट करा.',
    },
    downloadPdf: 'पीडीएफ डाउनलोड करा',
    downloading: 'डाउनलोड करत आहे...',
  },
};

function TextbookLink({ grade, subject }: { grade: string, subject: string }) {
  const [ncertLink, setNcertLink] = useState('https://ncert.nic.in/textbook.php');
  const { language } = useLanguage();
  const typedLanguage = language as keyof typeof translations;
  const t = translations[typedLanguage] || translations['English'];

  useEffect(() => {
    if (grade && subject) {
      const baseUrl = 'https://ncert.nic.in/textbook.php';
      setNcertLink(baseUrl);
    }
  }, [grade, subject]);

  if (!grade || !subject) {
    return (
       <Link href="https://ncert.nic.in/textbook.php" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="w-full">
            <BookOpen className="mr-2 h-4 w-4" />
            {t.goToNCERT}
          </Button>
        </Link>
    );
  }
  
  const gradeLabel = grades.find(g => g.value === grade)?.label;
  const subjectLabel = subjects.find(s => s.value === subject)?.label;

  return (
    <div className="text-center space-y-2">
      <p className="text-sm text-muted-foreground">
        {t.findResourcesFor(gradeLabel!, subjectLabel!)}
      </p>
      <Link href={ncertLink} target="_blank" rel="noopener noreferrer">
        <Button variant="outline" className="w-full">
          <BookOpen className="mr-2 h-4 w-4" />
          {t.searchNCERT}
        </Button>
      </Link>
    </div>
  );
}


export function LessonPlannerClient() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const typedLanguage = language as keyof typeof translations;
  const t = translations[typedLanguage] || translations['English'];

  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [result, setResult] = useState<GenerateLessonPlanOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lessonPlanRef = useRef<HTMLDivElement>(null);

  const formSchema = z.object({
    grade: z.string().min(1, t.formErrors.grade),
    subject: z.string().min(1, t.formErrors.subject),
    lessonName: z.string().min(3, t.formErrors.lessonName),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grade: '',
      subject: '',
      lessonName: '',
    },
  });

  const watchedGrade = useWatch({ control: form.control, name: 'grade' });
  const watchedSubject = useWatch({ control: form.control, name: 'subject' });
  const watchedLessonName = useWatch({ control: form.control, name: 'lessonName' });


  const handleClear = () => {
    form.reset();
    setResult(null);
    setError(null);
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const lessonPlanResult = await generateLessonPlan(values);
      setResult(lessonPlanResult);
    } catch (e: any) {
      console.error(e);
       if (e.message.includes('SAFETY')) {
        setError(t.safetyError);
      } else {
        toast({
          variant: 'destructive',
          title: t.errorTitle,
          description: t.errorDescription,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleDownloadPDF = async () => {
    if (!result || !lessonPlanRef.current) return;
    setIsDownloading(true);

    try {
        const pdf = new jsPDF('p', 'pt', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const margin = 40;
        let y = 40;

        // Header
        pdf.setFont('Arial', 'bold');
        pdf.setFontSize(10);
        pdf.text(watchedLessonName, pdfWidth / 2, y, { align: 'center' });
        y += 15;
        
        // Grade
        pdf.setFont('Arial', 'normal');
        pdf.setFontSize(10);
        const gradeLabel = grades.find(g => g.value === watchedGrade)?.label || `Grade ${watchedGrade}`;
        pdf.text(gradeLabel, pdfWidth / 2, y, { align: 'center' });
        y += 15;
        
        // Horizontal Line
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, y, pdfWidth - margin, y);
        y += 20;

        // Content
        const contentNode = lessonPlanRef.current;
        const lines = result.lessonPlanContent.split('\n');

        lines.forEach(line => {
            const isDayHeading = /^Day \d/.test(line.trim());
            const isOtherHeading = /^\d+\./.test(line.trim()) || /^\*{1,2}/.test(line.trim());

            if (isDayHeading) {
                pdf.setFont('Arial', 'bold');
                pdf.setFontSize(8);
            } else if (isOtherHeading) {
                pdf.setFont('Arial', 'bold');
                pdf.setFontSize(10);
            } else {
                pdf.setFont('Arial', 'normal');
                pdf.setFontSize(10);
            }
            
            const splitText = pdf.splitTextToSize(line, pdfWidth - margin * 2);

            splitText.forEach((textLine: string) => {
                 if (y > pdf.internal.pageSize.getHeight() - margin) {
                    pdf.addPage();
                    y = margin;
                }
                pdf.text(textLine, margin, y);
                y += 12; // line height
            });
        });

        pdf.save(`${watchedLessonName}.pdf`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not generate PDF.' });
    } finally {
        setIsDownloading(false);
    }
  };


  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1 flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle>{t.lessonPlanDetails}</CardTitle>
            <CardDescription>{t.specifyDetails}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                  control={form.control}
                  name="lessonName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.lessonName}</FormLabel>
                      <FormControl>
                        <Input placeholder={t.lessonNamePlaceholder} {...field} />
                      </FormControl>
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
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t.selectGrade} />
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
                      <FormLabel>{t.subject}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t.selectSubject} />
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
                <Button type="submit" className="w-full" disabled={isLoading || isDownloading}>
                  {isLoading ? t.generatingPlan : t.generatePlan}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t.textbookResources}</CardTitle>
            <CardDescription>{t.accessNCERT}</CardDescription>
          </CardHeader>
          <CardContent>
            <TextbookLink grade={watchedGrade} subject={watchedSubject} />
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="min-h-[400px]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>{t.generatedLessonPlan}</CardTitle>
                <CardDescription>{t.planWillBeStructured}</CardDescription>
            </div>
            {result && (
              <div className="flex items-center gap-2">
                <Button onClick={handleDownloadPDF} variant="outline" size="sm" disabled={isDownloading}>
                    <FileDown className="mr-2 h-4 w-4" />
                    {isDownloading ? t.downloading : t.downloadPdf}
                </Button>
                <Button onClick={handleClear} variant="ghost" size="icon">
                  <XCircle className="h-5 w-5" />
                  <span className="sr-only">{t.clearButton}</span>
                </Button>
              </div>
            )}
          </CardHeader>
           <CardContent>
             {isLoading && (
              <div className="space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            )}
            {error && (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>{t.contentBlockedTitle}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {result && (
              <div ref={lessonPlanRef} className="prose prose-sm max-w-none whitespace-pre-wrap rounded-md border bg-muted/50 p-4">
                {result.lessonPlanContent}
              </div>
            )}
            {!isLoading && !result && !error && (
              <div className="flex h-64 flex-col items-center justify-center text-center text-muted-foreground">
                <CalendarCheck className="h-16 w-16 mb-4" />
                <p>{t.emptyState}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
