'use server';

/**
 * @fileOverview Generates simple visual aids (line drawings or charts) based on teacher descriptions for blackboard replication.
 *
 * - designVisualAid - A function that handles the visual aid design process.
 * - DesignVisualAidInput - The input type for the designVisualAid function.
 * - DesignVisualAidOutput - The return type for the designVisualAid function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DesignVisualAidInputSchema = z.object({
  description: z
    .string()
    .describe('A description of the visual aid to generate.'),
});
export type DesignVisualAidInput = z.infer<typeof DesignVisualAidInputSchema>;

const DesignVisualAidOutputSchema = z.object({
  visualAid: z
    .string()
    .describe(
      "A visual aid, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DesignVisualAidOutput = z.infer<typeof DesignVisualAidOutputSchema>;

export async function designVisualAid(
  input: DesignVisualAidInput
): Promise<DesignVisualAidOutput> {
  return designVisualAidFlow(input);
}

const designVisualAidFlow = ai.defineFlow(
  {
    name: 'designVisualAidFlow',
    inputSchema: DesignVisualAidInputSchema,
    outputSchema: DesignVisualAidOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      // IMPORTANT: ONLY the googleai/gemini-2.0-flash-preview-image-generation model is able to generate images. You MUST use exactly this model to generate images.
      model: 'googleai/gemini-2.0-flash-preview-image-generation',

      prompt: `You are an AI assistant that generates simple, clear, and high-quality visual aids, like line drawings or charts, based on the description provided by the teacher. The visual aid should be easily replicable on a blackboard.

Description: ${input.description}`,

      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
        ],
      },
    });

    return {visualAid: media!.url!};
  }
);
