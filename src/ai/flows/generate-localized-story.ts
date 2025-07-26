'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating hyper-localized stories.
 *
 * - generateLocalizedStory - A function that generates a localized story based on user input.
 */

import {ai} from '@/ai/genkit';
import { GenerateLocalizedStoryInputSchema, GenerateLocalizedStoryOutputSchema, type GenerateLocalizedStoryInput, type GenerateLocalizedStoryOutput } from './schemas/generate-localized-story.schema';

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
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
    ],
  },
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
