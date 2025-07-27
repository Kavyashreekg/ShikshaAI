'use server';

/**
 * @fileOverview Provides simple, accurate explanations for complex student questions with analogies.
 *
 * - instantKnowledgeExplanation - A function that provides explanations for student questions.
 */

import {ai} from '@/ai/genkit';
import { InstantKnowledgeExplanationInputSchema, InstantKnowledgeExplanationOutputSchema, type InstantKnowledgeExplanationInput, type InstantKnowledgeExplanationOutput } from './schemas/instant-knowledge-explanation.schema';

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
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
    ],
  },
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
