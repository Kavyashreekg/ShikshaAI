'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Student } from '@/lib/student-data';
import { generateStudentSuggestions, GenerateStudentSuggestionsOutput } from '@/ai/flows/generate-student-suggestions';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function StudentSuggestions({ student }: { student: Student }) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateStudentSuggestionsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const suggestions = await generateStudentSuggestions(student);
      setResult(suggestions);
    } catch (e: any) {
      console.error(e);
      if (e.message.includes('SAFETY')) {
        setError('The generated suggestions were blocked for safety reasons. Please review the student notes and try again.');
      } else {
        toast({
          variant: 'destructive',
          title: 'An error occurred.',
          description: 'Failed to generate suggestions. Please try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Powered Suggestions</CardTitle>
        <CardDescription>Get personalized suggestions for this student.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
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
            <div className="prose prose-sm max-w-none rounded-md bg-muted/50 p-4" dangerouslySetInnerHTML={{ __html: result.suggestions.replace(/\n/g, '<br />') }} />
        )}
        {!isLoading && !result && !error && (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground space-y-4 min-h-[150px]">
                <Sparkles className="h-12 w-12" />
                <p>Click the button to generate personalized learning suggestions for {student.name}.</p>
            </div>
        )}
      </CardContent>
      <CardContent>
        <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
            {isLoading ? 'Generating...' : 'Generate Suggestions'}
        </Button>
      </CardContent>
    </Card>
  );
}
