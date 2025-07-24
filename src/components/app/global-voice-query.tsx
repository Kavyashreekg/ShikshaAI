'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Mic, StopCircle, Sparkles, Volume2, Lightbulb, ShieldAlert } from 'lucide-react';
import { speechToText } from '@/ai/flows/speech-to-text';
import {
  instantKnowledgeExplanation,
  InstantKnowledgeExplanationOutput,
} from '@/ai/flows/instant-knowledge-explanation';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { languages } from '@/lib/data';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export function GlobalVoiceQuery() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // For transcription and explanation
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [result, setResult] = useState<InstantKnowledgeExplanationOutput | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const resetState = () => {
    setIsRecording(false);
    setIsProcessing(false);
    setIsSynthesizing(false);
    setTranscribedText(null);
    setResult(null);
    setAudioUrl(null);
    setError(null);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      resetState();
    }
  };

  const handleStartRecording = async () => {
    resetState();
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
          setIsProcessing(true);
          setTranscribedText('Transcribing your question...');
          try {
            const { text } = await speechToText({ audioDataUri: base64Audio });
            setTranscribedText(text);

            if (text) {
              setResult({ explanation: 'Thinking...', analogy: 'Thinking...' });
              // Default to English for the global query
              const explanationResult = await instantKnowledgeExplanation({ question: text, language: 'English' });
              setResult(explanationResult);
            } else {
              setTranscribedText("Sorry, I couldn't hear that. Please try again.");
              setResult(null);
            }
          } catch (e: any) {
            console.error(e);
            if (e.message.includes('SAFETY')) {
              setError('The response was blocked for safety reasons. Please ask a different question.');
              setResult(null);
              // Keep the transcribed text to show the user what was blocked
              setTranscribedText(transcribedText);
            } else {
              toast({
                variant: 'destructive',
                title: 'An error occurred.',
                description: 'Failed to process your question. Please try again.',
              });
              resetState();
            }
          } finally {
            setIsProcessing(false);
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
        description: 'Please allow microphone access in your browser settings.',
      });
      setIsOpen(false);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  async function handleListen() {
    if (!result?.explanation) return;
    setIsSynthesizing(true);
    setAudioUrl(null);
    try {
      const fullText = `Here is the explanation for your question. Explanation: ${result.explanation}. Here is an analogy: ${result.analogy}`;
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
    <>
      <Button
        variant="primary"
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        onClick={() => handleOpenChange(true)}
      >
        <Mic className="h-7 w-7" />
        <span className="sr-only">Ask a question</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Ask me Anything</DialogTitle>
            <DialogDescription>
              Press the button to start recording your question. I will provide a simple explanation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <Button
                type="button"
                size="icon"
                className={cn('h-20 w-20 rounded-full', isRecording && 'bg-red-500 hover:bg-red-600')}
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                disabled={isProcessing}
              >
                {isRecording ? (
                  <StopCircle className="h-10 w-10 animate-pulse" />
                ) : isProcessing ? (
                  <Sparkles className="h-10 w-10 animate-spin" />
                ) : (
                  <Mic className="h-10 w-10" />
                )}
              </Button>
            </div>

            {transcribedText && (
              <div className="text-center text-muted-foreground italic">
                {isProcessing && transcribedText === 'Transcribing your question...' ? (
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4 animate-spin" />
                    <span>{transcribedText}</span>
                  </div>
                ) : (
                  <p>"{transcribedText}"</p>
                )}
              </div>
            )}
            
            {error && (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Content Blocked</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <div className="space-y-4 pt-4">
                {isSynthesizing && <Skeleton className="h-14 w-full" />}
                {audioUrl && (
                  <audio controls autoPlay src={audioUrl} className="w-full">
                    Your browser does not support the audio element.
                  </audio>
                )}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-accent" />
                      <CardTitle className="text-lg">Explanation</CardTitle>
                    </div>
                    {result.explanation && result.explanation !== 'Thinking...' && (
                       <Button onClick={handleListen} disabled={isSynthesizing || isProcessing} size="sm">
                         <Volume2 className="mr-2 h-4 w-4" />
                         {isSynthesizing ? 'Generating...' : 'Listen'}
                       </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {isProcessing && result.explanation === 'Thinking...' ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{result.explanation}</p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-accent" />
                      <CardTitle className="text-lg">Analogy</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                     {isProcessing && result.analogy === 'Thinking...' ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{result.analogy}</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
