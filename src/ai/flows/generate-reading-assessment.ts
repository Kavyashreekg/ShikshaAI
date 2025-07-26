'use server';
/**
 * @fileOverview This file defines a Genkit flow for creating a reading assessment.
 *
 * - generateReadingAssessment - A function that generates a reading passage and vocabulary.
 * - GenerateReadingAssessmentInput - The input type for the generateReadingAssessment function.
 * - GenerateReadingAssessmentOutput - The return type for the generateReadingAssessment function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateReadingAssessmentInputSchema = z.object({
  topic: z.string().describe('The topic for the reading passage.'),
  gradeLevel: z.string().describe('The grade level for the passage (e.g., "3").'),
  language: z.string().describe('The language for the assessment (e.g., "English", "Hindi").'),
});
export type GenerateReadingAssessmentInput = z.infer<typeof GenerateReadingAssessmentInputSchema>;

const GenerateReadingAssessmentOutputSchema = z.object({
  passage: z.string().describe('A reading passage suitable for the specified grade level and topic.'),
  vocabulary: z.array(
    z.object({
      word: z.string().describe('A key vocabulary word from the passage.'),
      definition: z.string().describe('A simple definition of the vocabulary word.'),
    })
  ).describe('A list of key vocabulary words from the passage with their definitions.'),
});
export type GenerateReadingAssessmentOutput = z.infer<typeof GenerateReadingAssessmentOutputSchema>;


export async function generateReadingAssessment(
  input: GenerateReadingAssessmentInput
): Promise<GenerateReadingAssessmentOutput> {
  return generateReadingAssessmentFlow(input);
}


const prompt = ai.definePrompt({
  name: 'generateReadingAssessmentPrompt',
  input: { schema: GenerateReadingAssessmentInputSchema },
  output: { schema: GenerateReadingAssessmentOutputSchema },
  prompt: `You are an expert curriculum developer creating reading materials for students in India.

  Your task is to generate a short, engaging, and student-friendly reading passage in {{{language}}} based on the given topic and grade level. The passage should be simple enough for a student in Grade {{{gradeLevel}}} to understand.

  After the passage, create a list of 3-5 key vocabulary words from the text. For each word, provide a very simple, one-sentence definition in {{{language}}} that is easy for a child to comprehend.

  Topic: {{{topic}}}
  Grade Level: {{{gradeLevel}}}
  Language: {{{language}}}
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

const generateReadingAssessmentFlow = ai.defineFlow(
  {
    name: 'generateReadingAssessmentFlow',
    inputSchema: GenerateReadingAssessmentInputSchema,
    outputSchema: GenerateReadingAssessmentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
