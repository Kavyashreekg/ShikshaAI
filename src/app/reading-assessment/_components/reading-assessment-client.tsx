'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  generateReadingAssessment,
  GenerateReadingAssessmentOutput,
} from '@/ai/flows/generate-reading-assessment';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { grades } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Sparkles, Volume2, ShieldAlert, FileText, Languages, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLanguage } from '@/context/language-context';

const translations = {
  English: {
    formCardTitle: 'Assessment Details',
    formCardDescription: 'Provide a topic and grade level.',
    topicLabel: 'Topic',
    topicPlaceholder: 'e.g., The Solar System, Famous Inventors',
    gradeLabel: 'Grade Level',
    gradePlaceholder: 'Select a grade',
    generateButton: 'Generate Passage',
    generatingButton: 'Generating...',
    resultsCardTitle: 'Reading Passage',
    resultsCardDescription: 'A reading passage to improve comprehension.',
    vocabCardTitle: 'Vocabulary Words',
    vocabCardDescription: 'Key words from the passage.',
    emptyState: 'Your generated passage and vocabulary will appear here.',
    listenButton: 'Listen to Passage',
    generatingAudioButton: 'Generating Audio...',
    clearButton: 'Clear',
    contentBlockedTitle: 'Content Blocked',
    safetyError: 'The generated content was blocked for safety reasons. Please try a different topic.',
    errorTitle: 'An error occurred.',
    errorDescription: 'Failed to generate the reading passage. Please try again.',
    audioErrorDescription: 'Failed to generate audio. Please try again.',
    formErrors: {
      topicMin: 'Please enter a topic.',
      gradeMin: 'Please select a grade level.',
    },
  },
  Hindi: {
    formCardTitle: 'मूल्यांकन विवरण',
    formCardDescription: 'एक विषय और ग्रेड स्तर प्रदान करें।',
    topicLabel: 'विषय',
    topicPlaceholder: 'जैसे, सौर मंडल, प्रसिद्ध आविष्कारक',
    gradeLabel: 'ग्रेड स्तर',
    gradePlaceholder: 'एक ग्रेड चुनें',
    generateButton: 'अनुच्छेद उत्पन्न करें',
    generatingButton: 'उत्पन्न हो रहा है...',
    resultsCardTitle: 'पठन अनुच्छेद',
    resultsCardDescription: 'समझ में सुधार के लिए एक पठन अनुच्छेद।',
    vocabCardTitle: 'शब्दावली',
    vocabCardDescription: 'अनुच्छेद से मुख्य शब्द।',
    emptyState: 'आपका उत्पन्न अनुच्छेद और शब्दावली यहाँ दिखाई देगी।',
    listenButton: 'अनुच्छेद सुनें',
    generatingAudioButton: 'ऑडियो बना रहा है...',
    clearButton: 'साफ़ करें',
    contentBlockedTitle: 'सामग्री अवरुद्ध',
    safetyError: 'सुरक्षा कारणों से उत्पन्न सामग्री को अवरुद्ध कर दिया गया था। कृपया एक अलग विषय का प्रयास करें।',
    errorTitle: 'एक त्रुटि हुई।',
    errorDescription: 'पठन अनुच्छेद उत्पन्न करने में विफल। कृपया पुनः प्रयास करें।',
    audioErrorDescription: 'ऑडियो उत्पन्न करने में विफल। कृपया पुनः प्रयास करें।',
    formErrors: {
      topicMin: 'कृपया एक विषय दर्ज करें।',
      gradeMin: 'कृपया एक ग्रेड स्तर चुनें।',
    },
  },
  Marathi: {
    formCardTitle: 'मूल्यांकन तपशील',
    formCardDescription: 'एक विषय आणि श्रेणी स्तर प्रदान करा.',
    topicLabel: 'विषय',
    topicPlaceholder: 'उदा., सूर्यमाला, प्रसिद्ध शोधक',
    gradeLabel: 'इयत्ता',
    gradePlaceholder: 'एक श्रेणी निवडा',
    generateButton: 'उतारा तयार करा',
    generatingButton: 'तयार होत आहे...',
    resultsCardTitle: 'वाचन उतारा',
    resultsCardDescription: 'समजून घेण्याची क्षमता सुधारण्यासाठी एक वाचन उतारा.',
    vocabCardTitle: 'शब्दसंग्रह',
    vocabCardDescription: 'उताऱ्यातील महत्त्वाचे शब्द.',
    emptyState: 'तुमचा तयार केलेला उतारा आणि शब्दसंग्रह येथे दिसेल.',
    listenButton: 'उतारा ऐका',
    generatingAudioButton: 'ऑडिओ तयार करत आहे...',
    clearButton: 'साफ करा',
    contentBlockedTitle: 'सामग्री अवरोधित',
    safetyError: 'सुरक्षेच्या कारणास्तव तयार केलेली सामग्री अवरोधित केली गेली. कृपया वेगळा विषय वापरून पहा.',
    errorTitle: 'एक त्रुटी आली.',
    errorDescription: 'वाचन उतारा तयार करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
    audioErrorDescription: 'ऑडिओ तयार करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
    formErrors: {
      topicMin: 'कृपया एक विषय प्रविष्ट करा.',
      gradeMin: 'कृपया एक श्रेणी स्तर निवडा.',
    },
  },
};

export function ReadingAssessmentClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateReadingAssessmentOutput | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations['English'];

  const formSchema = z.object({
    topic: z.string().min(1, t.formErrors.topicMin),
    gradeLevel: z.string().min(1, t.formErrors.gradeMin),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      gradeLevel: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setResult(null);
    setAudioUrl(null);
    setError(null);
    try {
      const assessmentResult = await generateReadingAssessment({ ...values, language });
      setResult(assessmentResult);
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
  };

  const handleListen = async () => {
    if (!result?.passage) return;
    setIsSynthesizing(true);
    setAudioUrl(null);
    try {
      const audioResult = await textToSpeech({ text: result.passage });
      setAudioUrl(audioResult.audio);
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: t.errorTitle,
        description: t.audioErrorDescription,
      });
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleClear = () => {
    form.reset();
    setResult(null);
    setAudioUrl(null);
    setError(null);
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <Card className="lg:col-span-1 h-fit">
        <CardHeader>
          <CardTitle>{t.formCardTitle}</CardTitle>
          <CardDescription>{t.formCardDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.topicLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.topicPlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gradeLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.gradeLabel}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t.gradePlaceholder} />
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
              <Button type="submit" disabled={isLoading} className="w-full">
                <Sparkles className="mr-2 h-4 w-4" />
                {isLoading ? t.generatingButton : t.generateButton}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="lg:col-span-2 space-y-6">
        {result && (
            <div className="flex justify-end gap-2">
                <Button onClick={handleListen} disabled={isSynthesizing || isLoading}>
                    <Volume2 className="mr-2 h-4 w-4" />
                    {isSynthesizing ? t.generatingAudioButton : t.listenButton}
                </Button>
                <Button onClick={handleClear} variant="outline">
                    <XCircle className="mr-2 h-4 w-4" />
                    {t.clearButton}
                </Button>
            </div>
        )}

        {isSynthesizing && <Skeleton className="h-14 w-full" />}
        {audioUrl && (
          <audio controls src={audioUrl} className="w-full">
            Your browser does not support the audio element.
          </audio>
        )}

        {error && (
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>{t.contentBlockedTitle}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        
        <div className='space-y-6'>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-accent" />
                    <CardTitle>{t.resultsCardTitle}</CardTitle>
                    </div>
                    <CardDescription>{t.resultsCardDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                    )}
                    {result && <p className="whitespace-pre-wrap">{result.passage}</p>}
                    {!isLoading && !result && !error && (
                        <div className="flex h-48 items-center justify-center text-center text-muted-foreground">
                            <p>{t.emptyState}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {result && result.vocabulary.length > 0 && (
                 <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Languages className="h-6 w-6 text-accent" />
                            <CardTitle>{t.vocabCardTitle}</CardTitle>
                        </div>
                        <CardDescription>{t.vocabCardDescription}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {result.vocabulary.map((item) => (
                                <li key={item.word}>
                                    <span className="font-semibold">{item.word}:</span> {item.definition}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}
