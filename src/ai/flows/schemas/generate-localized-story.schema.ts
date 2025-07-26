import {z} from 'genkit';

/**
 * @fileOverview Schemas for the generateLocalizedStory flow.
 *
 * - GenerateLocalizedStoryInputSchema - The Zod schema for the input of the generateLocalizedStory function.
 * - GenerateLocalizedStoryOutputSchema - The Zod schema for the output of the generateLocalizedStory function.
 * - GenerateLocalizedStoryInput - The TypeScript type for the input of the generateLocalizedStory function.
 * - GenerateLocalizedStoryOutput - The TypeScript type for the output of the generateLocalizedStory function.
 */

export const GenerateLocalizedStoryInputSchema = z.object({
  language: z.string().describe('The language in which to generate the story (e.g., Marathi).'),
  topic: z.string().describe('The topic of the story (e.g., farmers and soil types).'),
});
export type GenerateLocalizedStoryInput = z.infer<typeof GenerateLocalizedStoryInputSchema>;

export const GenerateLocalizedStoryOutputSchema = z.object({
  story: z.string().describe('The generated localized story.'),
});
export type GenerateLocalizedStoryOutput = z.infer<typeof GenerateLocalizedStoryOutputSchema>;
