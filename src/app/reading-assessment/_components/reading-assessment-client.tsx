'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  generateReadingAssessment,
  GenerateReadingAssessmentOutput,
} from '@/ai/flows/generate-reading-assessment';
import { speechToText } from '@/ai/flows/speech-to-text';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { generateReadingFeedback, GenerateReadingFeedbackOutput } from '@/ai/flows/generate-reading-feedback';
import { grades } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Sparkles, Volume2, ShieldAlert, FileText, Languages, XCircle, Mic, StopCircle, RefreshCw, MessageSquareQuote } from 'lucide-react';
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
    recordNow: 'Record Now',
    stopRecording: 'Stop Recording',
    replayRecording: 'Replay Recording',
    getFeedback: 'Get Feedback',
    gettingFeedback: 'Getting Feedback...',
    feedbackTitle: 'Instant Feedback',
    feedbackDescription: 'AI-powered suggestions for the student.',
    micError: 'Microphone access denied. Please enable it in your browser settings.',
    sttError: 'Could not understand the audio. Please try recording again.',
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
    recordNow: 'अभी रिकॉर्ड करें',
    stopRecording: 'रिकॉर्डिंग बंद करें',
    replayRecording: 'रिकॉर्डिंग फिर से चलाएं',
    getFeedback: 'प्रतिक्रिया प्राप्त करें',
    gettingFeedback: 'प्रतिक्रिया मिल रही है...',
    feedbackTitle: 'तुरंत प्रतिक्रिया',
    feedbackDescription: 'छात्र के लिए एआई-संचालित सुझाव।',
    micError: 'माइक्रोफोन एक्सेस अस्वीकृत। कृपया अपनी ब्राउज़र सेटिंग्स में इसे सक्षम करें।',
    sttError: 'ऑडियो समझ में नहीं आया। कृपया फिर से रिकॉर्ड करने का प्रयास करें।',
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
    generatingButton: 'ऑडिओ तयार करत आहे...',
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
    recordNow: 'आता रेकॉर्ड करा',
    stopRecording: 'रेकॉर्डिंग थांबवा',
    replayRecording: 'रेकॉर्डिंग पुन्हा प्ले करा',
    getFeedback: 'अभिप्राय मिळवा',
    gettingFeedback: 'अभिप्राय मिळत आहे...',
    feedbackTitle: 'झटपट अभिप्राय',
    feedbackDescription: 'विद्यार्थ्यासाठी AI-चालित सूचना.',
    micError: 'मायक्रोफोन प्रवेश नाकारला. कृपया तुमच्या ब्राउझर सेटिंग्जमध्ये तो सक्षम करा.',
    sttError: 'ऑडिओ समजू शकला नाही. कृपया पुन्हा रेकॉर्ड करण्याचा प्रयत्न करा.',
  },
};

export function ReadingAssessmentClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateReadingAssessmentOutput | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [studentAudioUrl, setStudentAudioUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<GenerateReadingFeedbackOutput | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

  const resetAll = () => {
    form.reset();
    setIsLoading(false);
    setResult(null);
    setAudioUrl(null);
    setError(null);
    setIsRecording(false);
    setStudentAudioUrl(null);
    setIsProcessing(false);
    setFeedback(null);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    resetAll();
    setIsLoading(true);
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

  const handleStartRecording = async () => {
    setStudentAudioUrl(null);
    setFeedback(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setStudentAudioUrl(audioUrl);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Mic error:', error);
      toast({ variant: 'destructive', title: 'Error', description: t.micError });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleGetFeedback = async () => {
    if (!studentAudioUrl || !result?.passage) return;
    setIsProcessing(true);
    setFeedback(null);
    try {
        const audioBlob = await fetch(studentAudioUrl).then(r => r.blob());
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            const { text: studentTranscript } = await speechToText({ audioDataUri: base64Audio });
            
            if (!studentTranscript) {
                toast({ variant: 'destructive', title: 'Error', description: t.sttError });
                setIsProcessing(false);
                return;
            }

            const feedbackResult = await generateReadingFeedback({
                passage: result.passage,
                studentTranscript: studentTranscript,
                language: language
            });
            setFeedback(feedbackResult);
        }
    } catch (e: any) {
        console.error("Feedback error", e);
        if (e.message.includes('SAFETY')) {
            setError(t.safetyError);
        } else {
            toast({ variant: 'destructive', title: t.errorTitle, description: 'Could not get feedback.' });
        }
    } finally {
        setIsProcessing(false);
    }
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
                <Button onClick={resetAll} variant="outline">
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
                 {result && (
                    <CardFooter className="flex flex-col items-start gap-4">
                        <div className="flex items-center gap-2">
                            <Button onClick={isRecording ? handleStopRecording : handleStartRecording} disabled={isProcessing}>
                                {isRecording ? <StopCircle className="mr-2 h-4 w-4 animate-pulse" /> : <Mic className="mr-2 h-4 w-4" />}
                                {isRecording ? t.stopRecording : t.recordNow}
                            </Button>
                            {studentAudioUrl && (
                                <>
                                    <audio src={studentAudioUrl} controls className="h-10"/>
                                    <Button onClick={handleGetFeedback} disabled={isProcessing}>
                                        {isProcessing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquareQuote className="mr-2 h-4 w-4" />}
                                        {isProcessing ? t.gettingFeedback : t.getFeedback}
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardFooter>
                 )}
            </Card>

            {feedback && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-accent" />
                            <CardTitle>{t.feedbackTitle}</CardTitle>
                        </div>
                        <CardDescription>{t.feedbackDescription}</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="prose prose-sm max-w-none whitespace-pre-wrap rounded-md bg-muted/50 p-4" dangerouslySetInnerHTML={{ __html: feedback.feedback.replace(/\n/g, '<br />') }} />
                    </CardContent>
                </Card>
            )}

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
