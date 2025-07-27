
// src/ai/flows/create-differentiated-worksheet.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for creating differentiated worksheets from a textbook page image.
 *
 * - createDifferentiatedWorksheet - A function that generates differentiated worksheets.
 * - CreateDifferentiatedWorksheetInput - The input type for the createDifferentiatedWorksheet function.
 * - CreateDifferentiatedWorksheetOutput - The return type for the createDifferentiatedWorksheet function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

const CreateDifferentiatedWorksheetInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a textbook page, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  difficultyLevels: z
    .string()
    .describe("The difficulty levels for which to differentiate the worksheet, separated by commas (e.g., 'Beginner,Intermediate')."),
});
export type CreateDifferentiatedWorksheetInput = z.infer<typeof CreateDifferentiatedWorksheetInputSchema>;

const CreateDifferentiatedWorksheetOutputSchema = z.object({
  worksheets: z.array(
    z.object({
      difficultyLevel: z.string().describe('The difficulty level of the worksheet.'),
      worksheetContent: z.string().describe('The content of the differentiated worksheet.'),
    })
  ).describe('An array of differentiated worksheets for each difficulty level.'),
});
export type CreateDifferentiatedWorksheetOutput = z.infer<typeof CreateDifferentiatedWorksheetOutputSchema>;

export async function createDifferentiatedWorksheet(input: CreateDifferentiatedWorksheetInput): Promise<CreateDifferentiatedWorksheetOutput> {
  return createDifferentiatedWorksheetFlow(input);
}

const promptInputSchema = CreateDifferentiatedWorksheetInputSchema.extend({
  difficultyLevelsArray: z.array(z.string()),
});

const createDifferentiatedWorksheetPrompt = ai.definePrompt({
  name: 'createDifferentiatedWorksheetPrompt',
  input: {schema: promptInputSchema},
  output: {schema: CreateDifferentiatedWorksheetOutputSchema},
  prompt: `You are an expert teacher specializing in creating differentiated worksheets for multi-level classrooms in Indian schools.

You will receive a photo of a textbook page and the difficulty levels to differentiate for.

Your task is to analyze the content of the textbook page and generate a worksheet tailored to each specified difficulty level. The worksheet should be relevant to the content of the textbook page.

- **Beginner:** This level is for students who are just starting with the topic. The questions should be simple, direct, and focus on basic comprehension and vocabulary.
- **Intermediate:** This level is for students who have a basic understanding. The questions should require some application of concepts and slightly more critical thinking.
- **Advanced:** This level is for students who are ready for a challenge. The questions should be complex, require synthesis of information, and encourage higher-order thinking.

Textbook Page: {{media url=photoDataUri}}

Ensure that the output is an array of worksheets, with each worksheet containing the difficulty level and the worksheet content. Each worksheet should be simple and culturally relevant to engage the students.

Please generate worksheets for the following difficulty levels:
{{#each difficultyLevelsArray}}
- Difficulty Level: {{this}}
{{/each}}
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

const createDifferentiatedWorksheetFlow = ai.defineFlow(
  {
    name: 'createDifferentiatedWorksheetFlow',
    inputSchema: CreateDifferentiatedWorksheetInputSchema,
    outputSchema: CreateDifferentiatedWorksheetOutputSchema,
  },
  async input => {
    // This is a workaround for NextJS environments where worker threads are problematic.
    // It disables the worker and runs PDF processing on the main thread.
    const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(Buffer.from(input.photoDataUri.split(',')[1], 'base64')),
        isEvalSupported: false,
        useSystemFonts: true,
    });
    
    const difficultyLevelsArray = input.difficultyLevels.split(',').map(s => s.trim()).filter(s => s);
    const {output} = await createDifferentiatedWorksheetPrompt({...input, difficultyLevelsArray});
    return output!;
  }
);
