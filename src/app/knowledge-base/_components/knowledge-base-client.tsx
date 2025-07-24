'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  instantKnowledgeExplanation,
  InstantKnowledgeExplanationOutput,
} from '@/ai/flows/instant-knowledge-explanation';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { speechToText } from '@/ai/flows/speech-to-text';
import { languages } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb, Sparkles, Mic, Volume2, StopCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  language: z.string().min(1, 'Please select a language.'),
  question: z.string().min(10, 'Please enter a question of at least 10 characters.'),
});

export function KnowledgeBaseClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<InstantKnowledgeExplanationOutput | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      language: '',
      question: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setAudioUrl(null);
    try {
      const explanationResult = await instantKnowledgeExplanation(values);
      setResult(explanationResult);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred.',
        description: 'Failed to generate the explanation. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          setIsTranscribing(true);
          try {
            const { text } = await speechToText({ audioDataUri: base64Audio });
            form.setValue('question', text);
          } catch (error) {
            console.error(error);
            toast({
              variant: 'destructive',
              title: 'An error occurred.',
              description: 'Failed to transcribe the audio. Please try again.',
            });
          } finally {
            setIsTranscribing(false);
          }
        };
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        variant: 'destructive',
        title: 'Microphone access denied.',
        description: 'Please allow microphone access in your browser settings to use this feature.',
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  async function handleListen() {
    if (!result) return;
    setIsSynthesizing(true);
    setAudioUrl(null);
    try {
      const fullText = `Explanation: ${result.explanation}. Analogy: ${result.analogy}`;
      const audioResult = await textToSpeech({ text: fullText });
      setAudioUrl(audioResult.audio);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred.',
        description: 'Failed to generate audio. Please try again.',
      });
    } finally {
      setIsSynthesizing(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Ask a Question</CardTitle>
          <CardDescription>Get a simple explanation for any topic.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student's Question</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Why is the sky blue? or click the mic to speak"
                          className="min-h-[120px] pr-10"
                          {...field}
                          disabled={isRecording || isTranscribing}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn('absolute bottom-2 right-2', isRecording && 'text-red-500')}
                        onClick={isRecording ? handleStopRecording : handleStartRecording}
                        disabled={isTranscribing}
                      >
                        {isRecording ? (
                          <StopCircle className="h-5 w-5 animate-pulse" />
                        ) : isTranscribing ? (
                          <Sparkles className="h-5 w-5 animate-spin" />
                        ) : (
                          <Mic className="h-5 w-5" />
                        )}
                        <span className="sr-only">{isRecording ? 'Stop recording' : 'Ask with voice'}</span>
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a language" />
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
              <Button type="submit" disabled={isLoading || isRecording || isTranscribing} className="w-full">
                {isLoading ? 'Thinking...' : 'Explain'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="lg:col-span-2 space-y-6">
        {result && (
          <div className="flex justify-end">
            <Button onClick={handleListen} disabled={isSynthesizing || isLoading}>
              <Volume2 className="mr-2 h-4 w-4" />
              {isSynthesizing ? 'Generating Audio...' : 'Listen to Answer'}
            </Button>
          </div>
        )}
        {isSynthesizing && <Skeleton className="h-14 w-full" />}
        {audioUrl && (
          <audio controls src={audioUrl} className="w-full">
            Your browser does not support the audio element.
          </audio>
        )}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-accent" />
              <CardTitle>Explanation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            )}
            {result && <p className="whitespace-pre-wrap">{result.explanation}</p>}
            {!isLoading && !result && <p className="text-muted-foreground">The explanation will appear here.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-accent" />
              <CardTitle>Analogy</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            )}
            {result && <p className="whitespace-pre-wrap">{result.analogy}</p>}
            {!isLoading && !result && <p className="text-muted-foreground">A helpful analogy will appear here.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
