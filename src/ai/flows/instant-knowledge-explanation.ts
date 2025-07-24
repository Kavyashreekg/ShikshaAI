// A Genkit flow for providing simple explanations to student questions, with analogies.
'use server';

/**
 * @fileOverview Provides simple, accurate explanations for complex student questions with analogies.
 *
 * - instantKnowledgeExplanation - A function that provides explanations for student questions.
 * - InstantKnowledgeExplanationInput - The input type for the instantKnowledgeExplanation function.
 * - InstantKnowledgeExplanationOutput - The return type for the instantKnowledgeExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InstantKnowledgeExplanationInputSchema = z.object({
  question: z.string().describe('The question to be explained.'),
  language: z.string().describe('The language for the explanation.'),
});
export type InstantKnowledgeExplanationInput = z.infer<typeof InstantKnowledgeExplanationInputSchema>;

const InstantKnowledgeExplanationOutputSchema = z.object({
  explanation: z.string().describe('The explanation of the question.'),
  analogy: z.string().describe('An analogy to help understand the explanation.'),
});
export type InstantKnowledgeExplanationOutput = z.infer<typeof InstantKnowledgeExplanationOutputSchema>;

export async function instantKnowledgeExplanation(input: InstantKnowledgeExplanationInput): Promise<InstantKnowledgeExplanationOutput> {
  return instantKnowledgeExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'instantKnowledgeExplanationPrompt',
  input: {schema: InstantKnowledgeExplanationInputSchema},
  output: {schema: InstantKnowledgeExplanationOutputSchema},
  prompt: `You are a helpful teacher explaining complex topics to students.

  The student asked: {{{question}}}

  Explain the answer in simple terms in {{{language}}}. Also, provide an analogy to help them understand.

  Here's the explanation:
  Explanation: {{explanation}}
  Analogy: {{analogy}}`,
});

const instantKnowledgeExplanationFlow = ai.defineFlow(
  {
    name: 'instantKnowledgeExplanationFlow',
    inputSchema: InstantKnowledgeExplanationInputSchema,
    outputSchema: InstantKnowledgeExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
