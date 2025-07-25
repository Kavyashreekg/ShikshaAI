'use client';

import { useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
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
import { Mic, StopCircle, Sparkles, Volume2, Lightbulb, ShieldAlert, BotMessageSquare, User } from 'lucide-react';
import { speechToText } from '@/ai/flows/speech-to-text';
import {
  instantKnowledgeExplanation,
  InstantKnowledgeExplanationOutput,
} from '@/ai/flows/instant-knowledge-explanation';
import {
  designVisualAid,
  DesignVisualAidOutput,
} from '@/ai/flows/design-visual-aid';
import {
    manageStudentFlow,
    ManageStudentFlowOutput,
    addStudentTool,
    addSubjectToStudentTool,
    removeStudentTool,
} from '@/ai/flows/manage-student-flow';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { translateText } from '@/ai/flows/translate-text';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { languages } from '@/lib/data';
import { useStudent } from '@/context/student-context';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

type QueryMode = 'knowledge' | 'visual-aid' | 'student-management';

export function GlobalVoiceQuery() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [result, setResult] = useState<InstantKnowledgeExplanationOutput | DesignVisualAidOutput | ManageStudentFlowOutput | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  const pathname = usePathname();
  const { addStudent, updateStudent, removeStudent: removeStudentFromContext, students } = useStudent();

  const getQueryMode = (): QueryMode => {
    if (pathname.startsWith('/visual-aids')) {
      return 'visual-aid';
    }
    if (pathname.startsWith('/student-assessment')) {
        return 'student-management';
    }
    return 'knowledge';
  };

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
          setTranscribedText('Transcribing your query...');
          try {
            const { text } = await speechToText({ audioDataUri: base64Audio });
            setTranscribedText(text);

            if (!text) {
              setTranscribedText("Sorry, I couldn't hear that. Please try again.");
              setResult(null);
              setIsProcessing(false);
              return;
            }

            const mode = getQueryMode();
            
            if (mode === 'visual-aid') {
                setResult({ visualAid: 'loading' });
                const visualResult = await designVisualAid({ description: text });
                setResult(visualResult);
            } else if (mode === 'student-management') {
                setResult({ response: 'Thinking...', toolOutputs: [] });
                const manageResult = await manageStudentFlow({ query: text });
                setResult(manageResult);
                
                // Handle the side-effects of the tools
                if (manageResult.toolOutputs && manageResult.toolOutputs.length > 0) {
                    for (const toolOutput of manageResult.toolOutputs) {
                        if (toolOutput.toolName === 'addStudent') {
                            const studentData = toolOutput.input as z.infer<typeof addStudentTool.inputSchema>;
                            const languageCodes = languages.map(l => l.value);
                            const { translations } = await translateText({ text: studentData.name, targetLanguages: languageCodes });
                            translations['English'] = studentData.name;
                            addStudent({ ...studentData, id: Date.now(), name: translations });
                            toast({ title: 'Student Added', description: `${studentData.name} has been added.` });
                        } else if (toolOutput.toolName === 'addSubjectToStudent') {
                           const subjectData = toolOutput.input as z.infer<typeof addSubjectToStudentTool.inputSchema>;
                            const studentToUpdate = students.find(s => s.name['English'].toLowerCase() === subjectData.studentName.toLowerCase());
                            if (studentToUpdate) {
                                const updatedStudent = {
                                    ...studentToUpdate,
                                    subjects: [...(studentToUpdate.subjects || []), { subject: subjectData.subject, gpa: subjectData.gpa }],
                                };
                                updateStudent(updatedStudent);
                                toast({ title: 'Subject Added', description: `Added ${subjectData.subject} to ${studentToUpdate.name['English']}.` });
                            } else {
                                toast({ variant: 'destructive', title: 'Student not found', description: `Could not find a student named ${subjectData.studentName}.` });
                            }
                        } else if (toolOutput.toolName === 'removeStudent') {
                           const removeData = toolOutput.input as z.infer<typeof removeStudentTool.inputSchema>;
                            const studentToRemove = students.find(s => s.name['English'].toLowerCase() === removeData.name.toLowerCase());
                            if (studentToRemove) {
                                removeStudentFromContext(studentToRemove.id);
                                toast({ title: 'Student Removed', description: `${studentToRemove.name['English']} has been removed.` });
                            } else {
                                toast({ variant: 'destructive', title: 'Student not found', description: `Could not find a student named ${removeData.name}.` });
                            }
                        }
                    }
                }

            } else { // Default knowledge mode
              setResult({ explanation: 'Thinking...', analogy: 'Thinking...' });
              const explanationResult = await instantKnowledgeExplanation({ question: text, language: 'English' });
              setResult(explanationResult);
            }

          } catch (e: any) {
            console.error(e);
            if (e.message.includes('SAFETY')) {
              setError('The response was blocked for safety reasons. Please try again.');
              setResult(null);
            } else {
              toast({
                variant: 'destructive',
                title: 'An error occurred.',
                description: 'Failed to process your query. Please try again.',
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

  async function handleListen(textToSpeak: string) {
    if (!textToSpeak) return;
    setIsSynthesizing(true);
    setAudioUrl(null);
    try {
      const audioResult = await textToSpeech({ text: textToSpeak });
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

  const renderResult = () => {
    if (!result) return null;
    const mode = getQueryMode();

    if (mode === 'knowledge' && 'explanation' in result) {
      const explanationResult = result as InstantKnowledgeExplanationOutput;
      const canListen = explanationResult.explanation && explanationResult.explanation !== 'Thinking...';
      const textToSpeak = `Here is the explanation for your question. Explanation: ${explanationResult.explanation}. Here is an analogy: ${explanationResult.analogy}`;
      
      return (
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
              {canListen && (
                 <Button onClick={() => handleListen(textToSpeak)} disabled={isSynthesizing || isProcessing} size="sm">
                   <Volume2 className="mr-2 h-4 w-4" />
                   {isSynthesizing ? 'Generating...' : 'Listen'}
                 </Button>
              )}
            </CardHeader>
            <CardContent>
              {isProcessing && explanationResult.explanation === 'Thinking...' ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{explanationResult.explanation}</p>
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
               {isProcessing && explanationResult.analogy === 'Thinking...' ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{explanationResult.analogy}</p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    if (mode === 'visual-aid' && 'visualAid' in result) {
        const visualAidResult = result as DesignVisualAidOutput;
        return (
            <div className="space-y-4 pt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Generated Visual Aid</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                        {isProcessing && visualAidResult.visualAid === 'loading' ? (
                            <Skeleton className="h-64 w-full" />
                        ) : (
                            <Image
                                src={visualAidResult.visualAid}
                                alt="Generated visual aid from voice query"
                                width={400}
                                height={400}
                                className="rounded-lg border object-contain"
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (mode === 'student-management' && 'response' in result) {
        const manageResult = result as ManageStudentFlowOutput;
        const canListen = manageResult.response && manageResult.response !== 'Thinking...';

        return (
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
                            <BotMessageSquare className="h-5 w-5 text-accent" />
                            <CardTitle className="text-lg">Assistant Response</CardTitle>
                        </div>
                        {canListen && (
                            <Button onClick={() => handleListen(manageResult.response)} disabled={isSynthesizing || isProcessing} size="sm">
                                <Volume2 className="mr-2 h-4 w-4" />
                                {isSynthesizing ? 'Generating...' : 'Listen'}
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                         {isProcessing && manageResult.response === 'Thinking...' ? (
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                            </div>
                        ) : (
                            <p className="whitespace-pre-wrap">{manageResult.response}</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        )
    }


    return null;
  }

  const getDialogDescription = () => {
    const mode = getQueryMode();
    switch (mode) {
        case 'visual-aid':
            return 'Press the button and describe the visual aid you want to create.';
        case 'student-management':
            return 'Press the button and tell me what to do. You can add, update, or remove students.';
        case 'knowledge':
        default:
            return 'Press the button to start recording your question. I will provide a simple explanation.';
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
             {getDialogDescription()}
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
              <div className="text-center text-muted-foreground p-2 rounded-md bg-muted/50 flex items-center justify-center gap-2">
                <User className="h-4 w-4 flex-shrink-0" />
                {isProcessing && transcribedText === 'Transcribing your query...' ? (
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4 animate-spin" />
                    <span>{transcribedText}</span>
                  </div>
                ) : (
                  <p className="italic">"{transcribedText}"</p>
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

            {renderResult()}

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
