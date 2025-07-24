'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';

import {
  createDifferentiatedWorksheet,
  CreateDifferentiatedWorksheetOutput,
} from '@/ai/flows/create-differentiated-worksheet';
import { subjects } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadCloud, Layers } from 'lucide-react';

const formSchema = z.object({
  photoDataUri: z.string().refine((val) => val.startsWith('data:image/'), {
    message: 'Please upload an image file.',
  }),
  gradeLevels: z.string().min(1, 'Please enter at least one grade level (e.g., 3, 4, 5).'),
  subject: z.string().min(1, 'Please select a subject.'),
  chapter: z.string().min(1, 'Please select a chapter.'),
});

export function WorksheetClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CreateDifferentiatedWorksheetOutput | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const worksheetResult = await createDifferentiatedWorksheet(values);
      setResult(worksheetResult);
      if (worksheetResult.worksheets.length === 0) {
        toast({
          variant: 'default',
          title: 'No worksheets generated',
          description: 'The AI could not generate worksheets from the provided image. Please try a clearer image or different page.',
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred.',
        description: 'Failed to generate worksheets. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const chaptersForSelectedSubject = subjects.find(s => s.value === selectedSubject)?.chapters || [];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <Card className="lg:col-span-1 h-fit">
        <CardHeader>
          <CardTitle>Textbook Page Details</CardTitle>
          <CardDescription>Upload a photo and provide details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="photoDataUri"
                render={() => (
                  <FormItem>
                    <FormLabel>Textbook Page Photo</FormLabel>
                    <FormControl>
                      <label htmlFor="file-upload" className="relative block w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary">
                        {preview ? (
                          <Image src={preview} alt="Textbook page preview" layout="fill" objectFit="contain" className="rounded-lg p-1" />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <UploadCloud className="w-8 h-8 mb-2" />
                            <span>Click to upload image</span>
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
                  <FormItem>
                    <FormLabel>Grade Levels</FormLabel>
                    <FormControl><Input placeholder="e.g., 2, 3, 4" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select onValueChange={(value) => { field.onChange(value); setSelectedSubject(value); form.setValue('chapter', ''); }} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger></FormControl>
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
                    <FormLabel>Chapter</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={!selectedSubject}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a chapter" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {chaptersForSelectedSubject.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Generating...' : 'Generate Worksheets'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="lg:col-span-2">
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle>Generated Worksheets</CardTitle>
            <CardDescription>Worksheets tailored for each grade level will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && <div className="space-y-4"><Skeleton className="h-10 w-1/2" /><Skeleton className="h-48 w-full" /></div>}
            {result && result.worksheets.length > 0 && (
              <Tabs defaultValue={result.worksheets[0].gradeLevel} className="w-full">
                <TabsList>
                  {result.worksheets.map(w => <TabsTrigger key={w.gradeLevel} value={w.gradeLevel}>Grade {w.gradeLevel}</TabsTrigger>)}
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
            {!isLoading && !result && (
              <div className="flex h-64 flex-col items-center justify-center text-center text-muted-foreground">
                <Layers className="h-16 w-16 mb-4" />
                <p>Your generated worksheets will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
