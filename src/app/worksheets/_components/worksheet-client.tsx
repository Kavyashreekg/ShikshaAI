
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  createDifferentiatedWorksheet,
  CreateDifferentiatedWorksheetOutput,
  CreateDifferentiatedWorksheetInput,
} from '@/ai/flows/create-differentiated-worksheet';
import { subjects, grades } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadCloud, Layers, ShieldAlert, Check, ChevronsUpDown, XCircle, History, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLanguage } from '@/context/language-context';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

type StoredWorksheet = CreateDifferentiatedWorksheetOutput & Omit<CreateDifferentiatedWorksheetInput, 'photoDataUri'> & { id: string, preview: string };


const translations = {
  English: {
    cardTitle: 'Textbook Page Details',
    cardDescription: 'Upload a photo and provide details.',
    photoLabel: 'Textbook Page Photo',
    uploadPrompt: 'Click to upload image',
    gradeLevelsLabel: 'Grade Levels',
    selectGrades: 'Select grades...',
    subjectLabel: 'Subject',
    subjectPlaceholder: 'Select a subject',
    chapterLabel: 'Chapter',
    chapterPlaceholder: 'Select a chapter',
    generateButton: 'Generate Worksheets',
    generatingButton: 'Generating...',
    resultsTitle: 'Generated Worksheets',
    resultsDescription: 'Worksheets tailored for each grade level will appear here.',
    emptyState: 'Your generated worksheets will appear here.',
    noWorksheetsTitle: 'No worksheets generated',
    noWorksheetsDescription: 'The AI could not generate worksheets from the provided image. Please try a clearer image or different page.',
    contentBlockedTitle: 'Content Blocked',
    safetyError: 'The generated content was blocked for safety reasons. Please try again with a different textbook page.',
    errorTitle: 'An error occurred.',
    errorDescription: 'Failed to generate worksheets. Please try again.',
    clearButton: 'Clear',
    viewHistoryButton: 'View History',
    historyDialogTitle: 'Stored Worksheets',
    historyDialogDescription: 'Here are the worksheets you have generated in the past. You can view, load, or delete them.',
    noHistory: 'You have not generated any worksheets yet.',
    loadWorksheetButton: 'Load Worksheets',
    deleteWorksheetButton: 'Delete',
    formErrors: {
      photo: 'Please upload an image file.',
      gradeLevels: 'Please select at least one grade level.',
      subject: 'Please select a subject.',
      chapter: 'Please select a chapter.',
    },
    grades: {
      'Grade 1': 'Grade 1', 'Grade 2': 'Grade 2', 'Grade 3': 'Grade 3', 'Grade 4': 'Grade 4', 'Grade 5': 'Grade 5', 'Grade 6': 'Grade 6', 'Grade 7': 'Grade 7', 'Grade 8': 'Grade 8', 'Grade 9': 'Grade 9', 'Grade 10': 'Grade 10', 'Grade 11': 'Grade 11', 'Grade 12': 'Grade 12',
    },
    command: {
        empty: 'No grades found.',
        placeholder: 'Search grades...',
    }
  },
  Hindi: {
    cardTitle: 'पाठ्यपुस्तक पृष्ठ विवरण',
    cardDescription: 'एक तस्वीर अपलोड करें और विवरण प्रदान करें।',
    photoLabel: 'पाठ्यपुस्तक पृष्ठ फोटो',
    uploadPrompt: 'छवि अपलोड करने के लिए क्लिक करें',
    gradeLevelsLabel: 'ग्रेड स्तर',
    selectGrades: 'ग्रेड चुनें...',
    subjectLabel: 'विषय',
    subjectPlaceholder: 'एक विषय चुनें',
    chapterLabel: 'अध्याय',
    chapterPlaceholder: 'एक अध्याय चुनें',
    generateButton: 'वर्कशीट उत्पन्न करें',
    generatingButton: 'उत्पन्न हो रहा है...',
    resultsTitle: 'उत्पन्न वर्कशीट',
    resultsDescription: 'प्रत्येक ग्रेड स्तर के लिए बनाई गई वर्कशीट यहाँ दिखाई देंगी।',
    emptyState: 'आपकी उत्पन्न वर्कशीट यहाँ दिखाई देंगी।',
    noWorksheetsTitle: 'कोई वर्कशीट उत्पन्न नहीं हुई',
    noWorksheetsDescription: 'एआई प्रदान की गई छवि से वर्कशीट उत्पन्न नहीं कर सका। कृपया एक स्पष्ट छवि या अलग पृष्ठ का प्रयास करें।',
    contentBlockedTitle: 'सामग्री अवरुद्ध',
    safetyError: 'उत्पन्न सामग्री को सुरक्षा कारणों से अवरुद्ध कर दिया गया था। कृपया एक अलग पाठ्यपुस्तक पृष्ठ के साथ पुनः प्रयास करें।',
    errorTitle: 'एक त्रुटि हुई।',
    errorDescription: 'वर्कशीट उत्पन्न करने में विफल। कृपया पुनः प्रयास करें।',
    clearButton: 'साफ़ करें',
    viewHistoryButton: 'इतिहास देखें',
    historyDialogTitle: 'संग्रहीत वर्कशीट',
    historyDialogDescription: 'यहाँ वे वर्कशीट हैं जो आपने अतीत में उत्पन्न की हैं। आप उन्हें देख, लोड या हटा सकते हैं।',
    noHistory: 'आपने अभी तक कोई वर्कशीट उत्पन्न नहीं की है।',
    loadWorksheetButton: 'वर्कशीट लोड करें',
    deleteWorksheetButton: 'हटाएं',
     formErrors: {
      photo: 'कृपया एक छवि फ़ाइल अपलोड करें।',
      gradeLevels: 'कृपया कम से-कम एक ग्रेड स्तर चुनें।',
      subject: 'कृपया एक विषय चुनें।',
      chapter: 'कृपया एक अध्याय चुनें।',
    },
    grades: {
      'Grade 1': 'ग्रेड 1', 'Grade 2': 'ग्रेड 2', 'Grade 3': 'ग्रेड 3', 'Grade 4': 'ग्रेड 4', 'Grade 5': 'ग्रेड 5', 'Grade 6': 'ग्रेड 6', 'Grade 7': 'ग्रेड 7', 'Grade 8': 'ग्रेड 8', 'Grade 9': 'ग्रेड 9', 'Grade 10': 'ग्रेड 10', 'Grade 11': 'ग्रेड 11', 'Grade 12': 'ग्रेड 12',
    },
    command: {
        empty: 'कोई ग्रेड नहीं मिला।',
        placeholder: 'ग्रेड खोजें...',
    }
  },
  Marathi: {
    cardTitle: 'पाठ्यपुस्तक पृष्ठ तपशील',
    cardDescription: 'एक फोटो अपलोड करा आणि तपशील द्या.',
    photoLabel: 'पाठ्यपुस्तक पृष्ठ फोटो',
    uploadPrompt: 'प्रतिमा अपलोड करण्यासाठी क्लिक करा',
    gradeLevelsLabel: 'इयत्ता स्तर',
    selectGrades: 'इयत्ता निवडा...',
    subjectLabel: 'विषय',
    subjectPlaceholder: 'एक विषय निवडा',
    chapterLabel: 'धडा',
    chapterPlaceholder: 'एक धडा निवडा',
    generateButton: 'कार्यपत्रके तयार करा',
    generatingButton: 'तयार होत आहे...',
    resultsTitle: 'तयार कार्यपत्रके',
    resultsDescription: 'प्रत्येक इयत्ता स्तरासाठी तयार केलेली कार्यपत्रके येथे दिसतील.',
    emptyState: 'तुमची तयार केलेली कार्यपत्रके येथे दिसतील.',
    noWorksheetsTitle: 'कोणतीही कार्यपत्रके तयार झाली नाहीत',
    noWorksheetsDescription: 'दिलेल्या प्रतिमेमधून AI कार्यपत्रके तयार करू शकले नाही. कृपया अधिक स्पष्ट प्रतिमा किंवा वेगळे पृष्ठ वापरून पहा.',
    contentBlockedTitle: 'सामग्री अवरोधित',
    safetyError: 'सुरक्षेच्या कारणास्तव तयार केलेली सामग्री अवरोधित केली गेली. कृपया वेगळ्या पाठ्यपुस्तक पृष्ठासह पुन्हा प्रयत्न करा.',
    errorTitle: 'एक त्रुटी आली.',
    errorDescription: 'कार्यपत्रके तयार करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
    clearButton: 'साफ करा',
    viewHistoryButton: 'इतिहास पहा',
    historyDialogTitle: 'साठवलेली कार्यपत्रके',
    historyDialogDescription: 'तुम्ही पूर्वी तयार केलेली कार्यपत्रके येथे आहेत. तुम्ही ती पाहू शकता, लोड करू शकता किंवा हटवू शकता.',
    noHistory: 'तुम्ही अद्याप कोणतीही कार्यपत्रके तयार केलेली नाहीत.',
    loadWorksheetButton: 'कार्यपत्रके लोड करा',
    deleteWorksheetButton: 'हटवा',
    formErrors: {
      photo: 'कृपया एक प्रतिमा फाइल अपलोड करा.',
      gradeLevels: 'कृपया किमान एक इयत्ता स्तर निवडा.',
      subject: 'कृपया एक विषय निवडा.',
      chapter: 'कृपया एक धडा निवडा.',
    },
    grades: {
      'Grade 1': 'इयत्ता १', 'Grade 2': 'इयत्ता २', 'Grade 3': 'इयत्ता ३', 'Grade 4': 'इयत्ता ४', 'Grade 5': 'इयत्ता ५', 'Grade 6': 'इयत्ता ६', 'Grade 7': 'इयत्ता ७', 'Grade 8': 'इयत्ता ८', 'Grade 9': 'इयत्ता ९', 'Grade 10': 'इयत्ता १०', 'Grade 11': 'इयत्ता ११', 'Grade 12': 'इयत्ता १२',
    },
    command: {
        empty: 'कोणतीही श्रेणी आढळली नाही.',
        placeholder: 'श्रेणी शोधा...',
    }
  },
};

export function WorksheetClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CreateDifferentiatedWorksheetOutput | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [history, setHistory] = useState<StoredWorksheet[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const { toast } = useToast();
  const { language } = useLanguage();
  const typedLanguage = language as keyof typeof translations;
  const t = translations[typedLanguage] || translations['English'];
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      loadHistory();
    }
  }, [isClient]);

  const loadHistory = () => {
    try {
      const storedHistory = localStorage.getItem('worksheetHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error('Failed to parse worksheetHistory from localStorage', error);
      localStorage.removeItem('worksheetHistory');
    }
  };

  const saveToHistory = (newWorksheet: StoredWorksheet) => {
    const updatedHistory = [newWorksheet, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('worksheetHistory', JSON.stringify(updatedHistory));
  };

  const deleteFromHistory = (worksheetId: string) => {
    const updatedHistory = history.filter(ws => ws.id !== worksheetId);
    setHistory(updatedHistory);
    localStorage.setItem('worksheetHistory', JSON.stringify(updatedHistory));
  };
  
  const loadFromHistory = (worksheet: StoredWorksheet) => {
    form.setValue('photoDataUri', worksheet.preview);
    form.setValue('gradeLevels', worksheet.gradeLevels);
    form.setValue('subject', worksheet.subject);
    form.setValue('chapter', worksheet.chapter);
    setPreview(worksheet.preview);
    setSelectedGrades(worksheet.gradeLevels.split(',').map(s => s.trim()));
    setSelectedSubject(worksheet.subject);
    setResult({ worksheets: worksheet.worksheets });
    setError(null);
    setIsHistoryOpen(false);
  };


  const formSchema = z.object({
    photoDataUri: z.string().refine((val) => val.startsWith('data:image/'), {
      message: t.formErrors.photo,
    }),
    gradeLevels: z.string().min(1, t.formErrors.gradeLevels),
    subject: z.string().min(1, t.formErrors.subject),
    chapter: z.string().min(1, t.formErrors.chapter),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      photoDataUri: '',
      gradeLevels: '',
      subject: '',
      chapter: '',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        form.setValue('photoDataUri', dataUri);
        setPreview(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGradeSelect = (gradeValue: string) => {
    const newSelectedGrades = selectedGrades.includes(gradeValue)
      ? selectedGrades.filter((g) => g !== gradeValue)
      : [...selectedGrades, gradeValue];
    setSelectedGrades(newSelectedGrades);
    form.setValue('gradeLevels', newSelectedGrades.join(', '));
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const worksheetResult = await createDifferentiatedWorksheet(values);
      setResult(worksheetResult);
       if (worksheetResult.worksheets.length > 0) {
        const { photoDataUri, ...otherValues } = values;
        saveToHistory({
          ...otherValues,
          ...worksheetResult,
          id: new Date().toISOString(),
          preview: photoDataUri,
        });
      } else {
        toast({
          variant: 'default',
          title: t.noWorksheetsTitle,
          description: t.noWorksheetsDescription,
        });
      }
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

  const handleClear = () => {
    form.reset();
    setResult(null);
    setError(null);
    setPreview(null);
    setSelectedGrades([]);
  };

  const chaptersForSelectedSubject = subjects.find(s => s.value === selectedSubject)?.chapters || [];
  const typedGradeTranslations = t.grades as Record<string, string>;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <Card className="lg:col-span-1 h-fit">
        <CardHeader>
          <CardTitle>{t.cardTitle}</CardTitle>
          <CardDescription>{t.cardDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="photoDataUri"
                render={() => (
                  <FormItem>
                    <FormLabel>{t.photoLabel}</FormLabel>
                    <FormControl>
                      <label htmlFor="file-upload" className="relative block w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary">
                        {preview ? (
                          <Image src={preview} alt="Textbook page preview" layout="fill" objectFit="contain" className="rounded-lg p-1" />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <UploadCloud className="w-8 h-8 mb-2" />
                            <span>{t.uploadPrompt}</span>
                          </div>
                        )}
                        <Input id="file-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                      </label>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gradeLevels"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t.gradeLevelsLabel}</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                        "w-full justify-between",
                                        !field.value && "text-muted-foreground"
                                    )}
                                >
                                    {selectedGrades.length > 0
                                        ? selectedGrades.map(g => typedGradeTranslations[grades.find(grade => grade.value === g)?.label || ''] || `Grade ${g}`).join(', ')
                                        : t.selectGrades}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder={t.command.placeholder} />
                                <CommandList>
                                    <CommandEmpty>{t.command.empty}</CommandEmpty>
                                    <CommandGroup>
                                        {grades.map((grade) => (
                                            <CommandItem
                                                value={grade.label}
                                                key={grade.value}
                                                onSelect={() => {
                                                    handleGradeSelect(grade.value);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedGrades.includes(grade.value) ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {typedGradeTranslations[grade.label] || grade.label}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.subjectLabel}</FormLabel>
                    <Select onValueChange={(value) => { field.onChange(value); setSelectedSubject(value); form.setValue('chapter', ''); }} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder={t.subjectPlaceholder} /></SelectTrigger></FormControl>
                      <SelectContent>
                        {subjects.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="chapter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.chapterLabel}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={!selectedSubject}>
                      <FormControl><SelectTrigger><SelectValue placeholder={t.chapterPlaceholder} /></SelectTrigger></FormControl>
                      <SelectContent>
                        {chaptersForSelectedSubject.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? t.generatingButton : t.generateButton}
                </Button>
                <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <History className="mr-2 h-4 w-4" /> {t.viewHistoryButton}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                        <DialogTitle>{t.historyDialogTitle}</DialogTitle>
                        <DialogDescription>{t.historyDialogDescription}</DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="h-96">
                        <div className="space-y-4 pr-4">
                            {history.length > 0 ? (
                            history.map(ws => (
                                <Card key={ws.id}>
                                <CardHeader className="flex-row items-center gap-4 space-y-0">
                                    <Image src={ws.preview} alt="preview" width={64} height={64} className="rounded-md border"/>
                                    <div>
                                        <CardTitle className="text-base">{ws.subject} - {ws.chapter}</CardTitle>
                                        <CardDescription>{ws.gradeLevels}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardFooter className="gap-2">
                                    <Button size="sm" onClick={() => loadFromHistory(ws)}>
                                        {t.loadWorksheetButton}
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => deleteFromHistory(ws.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </CardFooter>
                                </Card>
                            ))
                            ) : (
                            <p className="text-center text-muted-foreground">{t.noHistory}</p>
                            )}
                        </div>
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="lg:col-span-2">
        <Card className="min-h-[400px]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t.resultsTitle}</CardTitle>
              <CardDescription>{t.resultsDescription}</CardDescription>
            </div>
             {result && (
              <Button onClick={handleClear} variant="ghost" size="icon">
                <XCircle className="h-5 w-5" />
                <span className="sr-only">{t.clearButton}</span>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading && <div className="space-y-4"><Skeleton className="h-10 w-1/2" /><Skeleton className="h-48 w-full" /></div>}
            {error && (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>{t.contentBlockedTitle}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {result && result.worksheets.length > 0 && (
              <Tabs defaultValue={result.worksheets[0].gradeLevel} className="w-full">
                <TabsList>
                  {result.worksheets.map(w => <TabsTrigger key={w.gradeLevel} value={w.gradeLevel}>{typedGradeTranslations[grades.find(g => g.value === w.gradeLevel)?.label || ''] || `Grade ${w.gradeLevel}`}</TabsTrigger>)}
                </TabsList>
                {result.worksheets.map(w => (
                  <TabsContent key={w.gradeLevel} value={w.gradeLevel}>
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap rounded-md border bg-muted/50 p-4">
                      {w.worksheetContent}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
            {!isLoading && !result && !error && (
              <div className="flex h-64 flex-col items-center justify-center text-center text-muted-foreground">
                <Layers className="h-16 w-16 mb-4" />
                <p>{t.emptyState}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
