'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  generateLocalizedStory,
  GenerateLocalizedStoryOutput,
} from '@/ai/flows/generate-localized-story';
import { languages } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';

const formSchema = z.object({
  language: z.string().min(1, 'Please select a language.'),
  topic: z.string().min(10, 'Please describe the topic in at least 10 characters.'),
});

export function ContentGenerationClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateLocalizedStoryOutput | null>(null);
  const { toast } = useToast();

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
    try {
      const storyResult = await generateLocalizedStory(values);
      setResult(storyResult);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred.',
        description: 'Failed to generate the story. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Content Details</CardTitle>
          <CardDescription>Describe what you want to create.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., A story about farmers and different soil types"
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
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Generating...' : 'Generate Content'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="lg:col-span-2">
        <Card className="min-h-[400px]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Generated Story</CardTitle>
              <CardDescription>Your culturally relevant story will appear here.</CardDescription>
            </div>
            <Sparkles className="h-6 w-6 text-accent" />
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
            {result && (
              <div className="prose prose-sm max-w-none whitespace-pre-wrap rounded-md bg-muted/50 p-4">
                {result.story}
              </div>
            )}
            {!isLoading && !result && (
              <div className="flex h-64 items-center justify-center text-center text-muted-foreground">
                <p>Your generated content will be displayed here once you submit the form.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}