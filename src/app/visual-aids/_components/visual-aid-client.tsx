'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';

import { designVisualAid, DesignVisualAidOutput } from '@/ai/flows/design-visual-aid';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Paintbrush } from 'lucide-react';

const formSchema = z.object({
  description: z.string().min(10, 'Please describe the visual aid in at least 10 characters.'),
});

export function VisualAidClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DesignVisualAidOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const visualAidResult = await designVisualAid(values);
      setResult(visualAidResult);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred.',
        description: 'Failed to generate the visual aid. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Aid Description</CardTitle>
          <CardDescription>Describe the drawing or chart you need.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visual Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., A simple diagram of the water cycle with labels for evaporation, condensation, and precipitation."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Designing...' : 'Design Aid'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="lg:col-span-2">
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle>Generated Visual Aid</CardTitle>
            <CardDescription>A simple image you can draw on the blackboard.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {isLoading && <Skeleton className="h-80 w-full" />}
            {result && result.visualAid && (
              <Image
                src={result.visualAid}
                alt="Generated visual aid"
                width={500}
                height={500}
                className="rounded-lg border object-contain"
                data-ai-hint="diagram drawing"
              />
            )}
            {!isLoading && !result && (
              <div className="flex h-64 flex-col items-center justify-center text-center text-muted-foreground">
                <Paintbrush className="h-16 w-16 mb-4" />
                <p>Your generated visual aid will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
