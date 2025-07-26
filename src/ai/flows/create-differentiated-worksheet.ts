
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
  gradeLevels: z
    .string()
    .describe("The grade levels for which to differentiate the worksheet, separated by commas (e.g., '1, 2, 3')."),
  subject: z.string().describe('The subject of the worksheet.'),
  chapter: z.string().describe('The chapter of the textbook page.'),
});
export type CreateDifferentiatedWorksheetInput = z.infer<typeof CreateDifferentiatedWorksheetInputSchema>;

const CreateDifferentiatedWorksheetOutputSchema = z.object({
  worksheets: z.array(
    z.object({
      gradeLevel: z.string().describe('The grade level of the worksheet.'),
      worksheetContent: z.string().describe('The content of the differentiated worksheet.'),
    })
  ).describe('An array of differentiated worksheets for each grade level.'),
});
export type CreateDifferentiatedWorksheetOutput = z.infer<typeof CreateDifferentiatedWorksheetOutputSchema>;

export async function createDifferentiatedWorksheet(input: CreateDifferentiatedWorksheetInput): Promise<CreateDifferentiatedWorksheetOutput> {
  return createDifferentiatedWorksheetFlow(input);
}

const promptInputSchema = CreateDifferentiatedWorksheetInputSchema.extend({
  gradeLevelsArray: z.array(z.string()),
});

const createDifferentiatedWorksheetPrompt = ai.definePrompt({
  name: 'createDifferentiatedWorksheetPrompt',
  input: {schema: promptInputSchema},
  output: {schema: CreateDifferentiatedWorksheetOutputSchema},
  prompt: `You are an expert teacher specializing in creating differentiated worksheets for multi-grade classrooms in Indian schools.

You will receive a photo of a textbook page, the grade levels to differentiate for, the subject, and the chapter.

Your task is to generate a worksheet tailored to each specified grade level. The worksheet should be relevant to the content of the textbook page and suitable for the specified grade level.

Subject: {{{subject}}}
Chapter: {{{chapter}}}

Textbook Page: {{media url=photoDataUri}}

Ensure that the output is an array of worksheets, with each worksheet containing the grade level and the worksheet content. Each worksheet should be simple and culturally relevant to engage the students.

Please generate worksheets for the following grade levels:
{{#each gradeLevelsArray}}
- Grade Level: {{this}}
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
        data: Buffer.from(input.photoDataUri.split(',')[1], 'base64'),
        isEvalSupported: false,
        useSystemFonts: true,
    });
    
    const gradeLevelsArray = input.gradeLevels.split(',').map(s => s.trim()).filter(s => s);
    const {output} = await createDifferentiatedWorksheetPrompt({...input, gradeLevelsArray});
    return output!;
  }
);
