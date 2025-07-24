'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating hyper-localized stories.
 *
 * - generateLocalizedStory - A function that generates a localized story based on user input.
 * - GenerateLocalizedStoryInput - The input type for the generateLocalizedStory function.
 * - GenerateLocalizedStoryOutput - The return type for the generateLocalizedStory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLocalizedStoryInputSchema = z.object({
  language: z.string().describe('The language in which to generate the story (e.g., Marathi).'),
  topic: z.string().describe('The topic of the story (e.g., farmers and soil types).'),
});
export type GenerateLocalizedStoryInput = z.infer<typeof GenerateLocalizedStoryInputSchema>;

const GenerateLocalizedStoryOutputSchema = z.object({
  story: z.string().describe('The generated localized story.'),
});
export type GenerateLocalizedStoryOutput = z.infer<typeof GenerateLocalizedStoryOutputSchema>;

export async function generateLocalizedStory(
  input: GenerateLocalizedStoryInput
): Promise<GenerateLocalizedStoryOutput> {
  return generateLocalizedStoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLocalizedStoryPrompt',
  input: {schema: GenerateLocalizedStoryInputSchema},
  output: {schema: GenerateLocalizedStoryOutputSchema},
  prompt: `You are a storyteller specializing in creating hyper-localized and culturally relevant stories for children.

  Please generate a story in {{{language}}} about {{{topic}}}. The story should be simple, engaging, and easy for children to understand. Focus on using culturally relevant examples that would resonate with students in India.
  `,
});

const generateLocalizedStoryFlow = ai.defineFlow(
  {
    name: 'generateLocalizedStoryFlow',
    inputSchema: GenerateLocalizedStoryInputSchema,
    outputSchema: GenerateLocalizedStoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
