
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
  generateLocalizedStory
} from '@/ai/flows/generate-localized-story';
import { type GenerateLocalizedStoryOutput, type GenerateLocalizedStoryInput } from '@/ai/flows/schemas/generate-localized-story.schema';
import { generateStoryVideo } from '@/ai/flows/generate-story-video';
import { languages } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Video, ShieldAlert, XCircle, History, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLanguage } from '@/context/language-context';

type StoredStory = GenerateLocalizedStoryOutput & GenerateLocalizedStoryInput & { id: string };

const translations = {
  English: {
    cardTitle: 'Content Details',
    cardDescription: 'Describe what you want to create.',
    topicLabel: 'Topic',
    topicPlaceholder: 'e.g., A story about farmers and different soil types',
    languageLabel: 'Language',
    languagePlaceholder: 'Select a language',
    generating: 'Generating...',
    generateContent: 'Generate Content',
    generatedStoryTitle: 'Generated Story',
    generatedStoryDescription: 'Your culturally relevant story will appear here.',
    contentBlocked: 'Content Blocked',
    safetyErrorStory: 'The generated content was blocked for safety reasons. Please rephrase your topic and try again.',
    errorTitle: 'An error occurred.',
    errorDescriptionStory: 'Failed to generate the story. Please try again.',
    emptyState: 'Your generated content will be displayed here once you submit the form.',
    generatingVideo: 'Generating Video...',
    generateVideo: 'Generate Video Explanation',
    videoExplanationTitle: 'Video Explanation',
    videoGenerationProgress: 'Generating video, this may take a minute...',
    safetyErrorVideo: 'The generated video was blocked for safety reasons. The story might contain sensitive content. Please try generating a different story.',
    errorDescriptionVideo: 'Failed to generate the video. Please try again.',
    billingErrorVideo: 'Video generation requires a Google Cloud Platform project with billing enabled. Please check your account settings.',
    clearButton: 'Clear',
    viewHistoryButton: 'View History',
    historyDialogTitle: 'Stored Stories',
    historyDialogDescription: 'Here are the stories you have generated in the past. You can view, load, or delete them.',
    noHistory: 'You have not generated any stories yet.',
    loadStoryButton: 'Load Story',
    deleteStoryButton: 'Delete',
    formErrors: {
        languageMin: 'Please select a language.',
        topicMin: 'Please describe the topic in at least 10 characters.',
    },
  },
  Hindi: {
    cardTitle: 'सामग्री विवरण',
    cardDescription: 'आप जो बनाना चाहते हैं उसका वर्णन करें।',
    topicLabel: 'विषय',
    topicPlaceholder: 'जैसे, किसानों और विभिन्न प्रकार की मिट्टी के बारे में एक कहानी',
    languageLabel: 'भाषा',
    languagePlaceholder: 'एक भाषा चुनें',
    generating: 'उत्पन्न हो रहा है...',
    generateContent: 'सामग्री उत्पन्न करें',
    generatedStoryTitle: 'उत्पन्न कहानी',
    generatedStoryDescription: 'आपकी सांस्कृतिक रूप से प्रासंगिक कहानी यहाँ दिखाई देगी।',
    contentBlocked: 'सामग्री अवरुद्ध',
    safetyErrorStory: 'सुरक्षा कारणों से उत्पन्न सामग्री को अवरुद्ध कर दिया गया था। कृपया अपना विषय फिर से लिखें और पुनः प्रयास करें।',
    errorTitle: 'एक त्रुटि हुई।',
    errorDescriptionStory: 'कहानी उत्पन्न करने में विफल। कृपया पुनः प्रयास करें।',
    emptyState: 'आपके द्वारा फ़ॉर्म जमा करने के बाद आपकी उत्पन्न सामग्री यहाँ प्रदर्शित की जाएगी।',
    generatingVideo: 'वीडियो उत्पन्न हो रहा है...',
    generateVideo: 'वीडियो स्पष्टीकरण उत्पन्न करें',
    videoExplanationTitle: 'वीडियो स्पष्टीकरण',
    videoGenerationProgress: 'वीडियो उत्पन्न हो रहा है, इसमें एक मिनट लग सकता है...',
    safetyErrorVideo: 'सुरक्षा कारणों से उत्पन्न वीडियो को अवरुद्ध कर दिया गया था। कहानी में संवेदनशील सामग्री हो सकती है। कृपया एक अलग कहानी उत्पन्न करने का प्रयास करें।',
    errorDescriptionVideo: 'वीडियो उत्पन्न करने में विफल। कृपया पुनः प्रयास करें।',
    billingErrorVideo: 'वीडियो बनाने के लिए बिलिंग सक्षम Google क्लाउड प्लेटफ़ॉर्म प्रोजेक्ट की आवश्यकता है। कृपया अपनी खाता सेटिंग जांचें।',
    clearButton: 'साफ़ करें',
    viewHistoryButton: 'इतिहास देखें',
    historyDialogTitle: 'संग्रहीत कहानियाँ',
    historyDialogDescription: 'यहाँ वे कहानियाँ हैं जो आपने अतीत में उत्पन्न की हैं। आप उन्हें देख, लोड या हटा सकते हैं।',
    noHistory: 'आपने अभी तक कोई कहानी उत्पन्न नहीं की है।',
    loadStoryButton: 'कहानी लोड करें',
    deleteStoryButton: 'हटाएं',
     formErrors: {
        languageMin: 'कृपया एक भाषा चुनें।',
        topicMin: 'कृपया विषय का कम से कम 10 अक्षरों में वर्णन करें।',
    },
  },
  Marathi: {
    cardTitle: 'सामग्री तपशील',
    cardDescription: 'तुम्हाला काय तयार करायचे आहे त्याचे वर्णन करा.',
    topicLabel: 'विषय',
    topicPlaceholder: 'उदा., शेतकरी आणि विविध प्रकारच्या मातीबद्दलची कथा',
    languageLabel: 'भाषा',
    languagePlaceholder: 'एक भाषा निवडा',
    generating: 'तयार होत आहे...',
    generateContent: 'सामग्री तयार करा',
    generatedStoryTitle: 'तयार केलेली कथा',
    generatedStoryDescription: 'तुमची सांस्कृतिकदृष्ट्या संबंधित कथा येथे दिसेल.',
    contentBlocked: 'सामग्री अवरोधित',
    safetyErrorStory: 'सुरक्षेच्या कारणास्तव तयार केलेली सामग्री अवरोधित केली गेली. कृपया तुमचा विषय पुन्हा लिहा आणि पुन्हा प्रयत्न करा.',
    errorTitle: 'एक त्रुटी आली.',
    errorDescriptionStory: 'कथा तयार करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
    emptyState: 'तुम्ही फॉर्म सबमिट केल्यानंतर तुमची तयार केलेली सामग्री येथे प्रदर्शित केली जाईल.',
    generatingVideo: 'व्हिडिओ तयार होत आहे...',
    generateVideo: 'व्हिडिओ स्पष्टीकरण तयार करा',
    videoExplanationTitle: 'व्हिडिओ स्पष्टीकरण',
    videoGenerationProgress: 'व्हिडिओ तयार होत आहे, यास एक मिनिट लागू शकतो...',
    safetyErrorVideo: 'सुरक्षेच्या कारणास्तव तयार केलेला व्हिडिओ अवरोधित केला गेला. कथेत संवेदनशील सामग्री असू शकते. कृपया वेगळी कथा तयार करण्याचा प्रयत्न करा.',
    errorDescriptionVideo: 'व्हिडिओ तयार करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
    billingErrorVideo: 'व्हिडिओ निर्मितीसाठी बिलिंग सक्षम असलेले Google क्लाउड प्लॅटफॉर्म प्रकल्प आवश्यक आहे. कृपया तुमची खाते सेटिंग्ज तपासा.',
    clearButton: 'साफ करा',
    viewHistoryButton: 'इतिहास पहा',
    historyDialogTitle: 'साठवलेल्या कथा',
    historyDialogDescription: 'तुम्ही पूर्वी तयार केलेल्या कथा येथे आहेत. तुम्ही त्या पाहू शकता, लोड करू शकता किंवा हटवू शकता.',
    noHistory: 'तुम्ही अद्याप कोणतीही कथा तयार केलेली नाही.',
    loadStoryButton: 'कथा लोड करा',
    deleteStoryButton: 'हटवा',
     formErrors: {
        languageMin: 'कृपया एक भाषा निवडा.',
        topicMin: 'कृपया विषयाचे किमान १० अक्षरांमध्ये वर्णन करा.',
    },
  },
};

export function ContentGenerationClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [result, setResult] = useState<GenerateLocalizedStoryOutput | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [history, setHistory] = useState<StoredStory[]>([]);
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
      const storedHistory = localStorage.getItem('storyHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error('Failed to parse storyHistory from localStorage', error);
      localStorage.removeItem('storyHistory');
    }
  };

  const saveToHistory = (newStory: StoredStory) => {
    const updatedHistory = [newStory, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('storyHistory', JSON.stringify(updatedHistory));
  };
  
  const deleteFromHistory = (storyId: string) => {
    const updatedHistory = history.filter(story => story.id !== storyId);
    setHistory(updatedHistory);
    localStorage.setItem('storyHistory', JSON.stringify(updatedHistory));
  };

  const loadFromHistory = (story: StoredStory) => {
    form.setValue('topic', story.topic);
    form.setValue('language', story.language);
    setResult({ story: story.story });
    setVideoUrl(null);
    setError(null);
    setVideoError(null);
    setIsHistoryOpen(false);
  };

  const formSchema = z.object({
    language: z.string().min(1, t.formErrors.languageMin),
    topic: z.string().min(10, t.formErrors.topicMin),
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      language: '',
      topic: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setVideoUrl(null);
    setError(null);
    setVideoError(null);
    try {
      const storyResult = await generateLocalizedStory(values);
      setResult(storyResult);
      saveToHistory({ ...values, ...storyResult, id: new Date().toISOString() });
    } catch (e: any) {
      console.error(e);
      if (e.message.includes('SAFETY')) {
        setError(t.safetyErrorStory);
      } else {
        toast({
          variant: 'destructive',
          title: t.errorTitle,
          description: t.errorDescriptionStory,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGenerateVideo() {
    if (!result?.story) return;
    setIsGeneratingVideo(true);
    setVideoUrl(null);
    setVideoError(null);
    try {
      const videoResult = await generateStoryVideo({ story: result.story });
      setVideoUrl(videoResult.video);
    } catch (e: any) {
      console.error(e);
       if (e.message.includes('billing enabled')) {
        setVideoError(t.billingErrorVideo);
      } else if (e.message.includes('SAFETY')) {
        setVideoError(t.safetyErrorVideo);
      } else {
        setVideoError(e.message || t.errorDescriptionVideo);
      }
    } finally {
      setIsGeneratingVideo(false);
    }
  }
  
  function handleClear() {
    form.reset();
    setResult(null);
    setVideoUrl(null);
    setError(null);
    setVideoError(null);
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>{t.cardTitle}</CardTitle>
          <CardDescription>{t.cardDescription}</CardDescription>
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
                      <Textarea
                        placeholder={t.topicPlaceholder}
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.languageLabel}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t.languagePlaceholder} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" disabled={isLoading || isGeneratingVideo} className="w-full">
                  {isLoading ? t.generating : t.generateContent}
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
                            history.map(story => (
                                <Card key={story.id}>
                                <CardHeader>
                                    <CardTitle className="text-base">{story.topic}</CardTitle>
                                    <CardDescription>{story.language}</CardDescription>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground line-clamp-2">
                                    {story.story}
                                </CardContent>
                                <CardFooter className="gap-2">
                                    <Button size="sm" onClick={() => loadFromHistory(story)}>
                                        {t.loadStoryButton}
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => deleteFromHistory(story.id)}>
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

      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t.generatedStoryTitle}</CardTitle>
              <CardDescription>{t.generatedStoryDescription}</CardDescription>
            </div>
             <div className="flex items-center gap-2">
                {result && (
                  <Button onClick={handleClear} variant="ghost" size="icon">
                    <XCircle className="h-5 w-5" />
                    <span className="sr-only">{t.clearButton}</span>
                  </Button>
                )}
                <Sparkles className="h-6 w-6 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            )}
            {error && (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>{t.contentBlocked}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {result && (
              <div className="prose prose-sm max-w-none whitespace-pre-wrap rounded-md bg-muted/50 p-4">
                {result.story}
              </div>
            )}
            {!isLoading && !result && !error && (
              <div className="flex h-64 items-center justify-center text-center text-muted-foreground">
                <p>{t.emptyState}</p>
              </div>
            )}
          </CardContent>
          {result && (
            <CardFooter>
              <Button onClick={handleGenerateVideo} disabled={isGeneratingVideo || isLoading} className="w-full">
                <Video className="mr-2 h-4 w-4" />
                {isGeneratingVideo ? t.generatingVideo : t.generateVideo}
              </Button>
            </CardFooter>
          )}
        </Card>
        {(isGeneratingVideo || videoUrl || videoError) && (
          <Card>
            <CardHeader>
              <CardTitle>{t.videoExplanationTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              {isGeneratingVideo && (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Skeleton className="h-48 w-full max-w-lg" />
                  <p className="text-center text-muted-foreground">{t.videoGenerationProgress}</p>
                </div>
              )}
               {videoError && (
                <Alert variant="destructive">
                  <ShieldAlert className="h-4 w-4" />
                  <AlertTitle>{t.errorTitle}</AlertTitle>
                  <AlertDescription>{videoError}</AlertDescription>
                </Alert>
              )}
              {videoUrl && (
                <video controls src={videoUrl} className="w-full rounded-md" />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
