'use server';
/**
 * @fileOverview A Genkit flow for translating text into multiple languages.
 *
 * - translateText - A function that handles text translation.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to translate.'),
  targetLanguages: z.array(z.string()).describe('An array of target languages (e.g., ["Hindi", "Marathi"]).'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translations: z.record(z.string()).describe('A dictionary mapping language to translated text.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;


export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  const outputSchema = z.object({
    translations: z.object(
      input.targetLanguages.reduce((acc, lang) => {
        acc[lang] = z.string().describe(`The translated text in ${lang}.`);
        return acc;
      }, {} as Record<string, z.ZodString>)
    ),
  });

  const translateTextPrompt = ai.definePrompt({
    name: 'translateTextDynamicPrompt',
    input: {schema: TranslateTextInputSchema},
    output: {schema: outputSchema},
    prompt: `Translate the following text into the specified target languages.

  Text to Translate: {{{text}}}

  Target Languages:
  {{#each targetLanguages}}
  - {{{this}}}
  {{/each}}

  Return the translations as a JSON object where the keys are the language names and the values are the translated text.
  `,
  });
  
  const {output} = await translateTextPrompt(input);
  return output!;
}
