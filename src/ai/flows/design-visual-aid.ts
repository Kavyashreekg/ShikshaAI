
'use server';

/**
 * @fileOverview Generates simple visual aids (line drawings or charts) based on teacher descriptions for blackboard replication.
 *
 * - designVisualAid - A function that handles the visual aid design process.
 */

import {ai} from '@/ai/genkit';
import { DesignVisualAidInputSchema, DesignVisualAidOutputSchema, type DesignVisualAidInput, type DesignVisualAidOutput } from './schemas/design-visual-aid.schema';

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

      prompt: `You are an expert graphic designer specializing in educational visual aids for teachers. Your task is to generate a simple, clear, and high-contrast line drawing or chart based on the user's description.

      The output MUST be:
      - **Minimalist:** Use clean, simple lines. Avoid shading, complex textures, or excessive detail.
      - **High Contrast:** Black and white or very simple, distinct colors suitable for a blackboard.
      - **Easily Replicable:** The design should be simple enough for a teacher to easily draw on a blackboard.
      - **Educational:** The style should be appropriate for a classroom setting (e.g., diagrams, simple illustrations, charts).
      - **Focused:** The image should only contain the core concept described by the user.

      User's Description: "${input.description}"`,

      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
        ],
      },
    });

    return {visualAid: media!.url!};
  }
);
