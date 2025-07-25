'use server';

/**
 * @fileOverview A Genkit flow for generating personalized student suggestions.
 *
 * - generateStudentSuggestions - A function that generates suggestions for a student.
 * - GenerateStudentSuggestionsInput - The input type for the generateStudentSuggestions function.
 * - GenerateStudentSuggestionsOutput - The return type for the generateStudentSuggestions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SubjectPerformanceSchema = z.object({
  subject: z.string(),
  gpa: z.number(),
});

const GenerateStudentSuggestionsInputSchema = z.object({
  name: z.string().describe('The name of the student.'),
  grade: z.string().describe('The grade of the student.'),
  language: z.string().describe('The language for the suggestions.'),
  notes: z.string().optional().describe("The teacher's notes about the student."),
  subjects: z.array(SubjectPerformanceSchema).optional().describe('A list of subjects and the student\'s GPA in each.'),
});
export type GenerateStudentSuggestionsInput = z.infer<typeof GenerateStudentSuggestionsInputSchema>;

const GenerateStudentSuggestionsOutputSchema = z.object({
  suggestions: z.string().describe('Personalized suggestions for the student, formatted as a markdown list.'),
});
export type GenerateStudentSuggestionsOutput = z.infer<typeof GenerateStudentSuggestionsOutputSchema>;

export async function generateStudentSuggestions(
  input: GenerateStudentSuggestionsInput
): Promise<GenerateStudentSuggestionsOutput> {
  return generateStudentSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStudentSuggestionsPrompt',
  input: { schema: GenerateStudentSuggestionsInputSchema },
  output: { schema: GenerateStudentSuggestionsOutputSchema },
  prompt: `You are an expert educational assistant. Your goal is to provide actionable, personalized suggestions for a student based on their performance and teacher's notes.

  Student Details:
  - Name: {{{name}}}
  - Grade: {{{grade}}}

  Teacher's Notes:
  {{{notes}}}

  Subject Performance (GPA):
  {{#if subjects}}
    {{#each subjects}}
    - {{{this.subject}}}: {{{this.gpa}}}
    {{/each}}
  {{else}}
    No subject performance data available.
  {{/if}}

  Based on all the information provided, generate a list of 2-3 targeted, positive, and constructive suggestions for the teacher to help this student improve. The suggestions should be formatted as a markdown list and written in {{{language}}}.
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

const generateStudentSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateStudentSuggestionsFlow',
    inputSchema: GenerateStudentSuggestionsInputSchema,
    outputSchema: GenerateStudentSuggestionsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
