import {z} from 'genkit';

/**
 * @fileOverview Schemas for the designVisualAid flow.
 *
 * - DesignVisualAidInputSchema - The Zod schema for the input of the designVisualAid function.
 * - DesignVisualAidOutputSchema - The Zod schema for the output of the designVisualAid function.
 * - DesignVisualAidInput - The TypeScript type for the input of the designVisualAid function.
 * - DesignVisualAidOutput - The TypeScript type for the output of the designVisualAid function.
 */

export const DesignVisualAidInputSchema = z.object({
  description: z
    .string()
    .describe('A description of the visual aid to generate.'),
});
export type DesignVisualAidInput = z.infer<typeof DesignVisualAidInputSchema>;

export const DesignVisualAidOutputSchema = z.object({
  visualAid: z
    .string()
    .describe(
      "A visual aid, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DesignVisualAidOutput = z.infer<typeof DesignVisualAidOutputSchema>;
