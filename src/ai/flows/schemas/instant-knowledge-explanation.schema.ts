import {z} from 'genkit';

/**
 * @fileOverview Schemas for the instantKnowledgeExplanation flow.
 *
 * - InstantKnowledgeExplanationInputSchema - The Zod schema for the input of the instantKnowledgeExplanation function.
 * - InstantKnowledgeExplanationOutputSchema - The Zod schema for the output of the instantKnowledgeExplanation function.
 * - InstantKnowledgeExplanationInput - The TypeScript type for the input of the instantKnowledgeExplanation function.
 * - InstantKnowledgeExplanationOutput - The TypeScript type for the output of the instantKnowledgeExplanation function.
 */

export const InstantKnowledgeExplanationInputSchema = z.object({
  question: z.string().describe('The question to be explained.'),
  language: z.string().describe('The language for the explanation.'),
});
export type InstantKnowledgeExplanationInput = z.infer<typeof InstantKnowledgeExplanationInputSchema>;

export const InstantKnowledgeExplanationOutputSchema = z.object({
  explanation: z.string().describe('The explanation of the question.'),
  analogy: z.string().describe('An analogy to help understand the explanation.'),
});
export type InstantKnowledgeExplanationOutput = z.infer<typeof InstantKnowledgeExplanationOutputSchema>;
