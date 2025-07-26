'use server';
/**
 * @fileOverview This file defines a Genkit flow for providing feedback on a student's reading.
 *
 * - generateReadingFeedback - A function that analyzes a student's reading and provides feedback.
 * - GenerateReadingFeedbackInput - The input type for the generateReadingFeedback function.
 * - GenerateReadingFeedbackOutput - The return type for the generateReadingFeedback function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateReadingFeedbackInputSchema = z.object({
  passage: z.string().describe('The original reading passage.'),
  studentTranscript: z.string().describe("The student's transcribed reading of the passage."),
  language: z.string().describe('The language of the passage and feedback.'),
});
export type GenerateReadingFeedbackInput = z.infer<typeof GenerateReadingFeedbackInputSchema>;

const GenerateReadingFeedbackOutputSchema = z.object({
  feedback: z.string().describe('Constructive feedback and appreciation for the student, formatted as a markdown list.'),
});
export type GenerateReadingFeedbackOutput = z.infer<typeof GenerateReadingFeedbackOutputSchema>;


export async function generateReadingFeedback(
  input: GenerateReadingFeedbackInput
): Promise<GenerateReadingFeedbackOutput> {
  return generateReadingFeedbackFlow(input);
}


const prompt = ai.definePrompt({
  name: 'generateReadingFeedbackPrompt',
  input: { schema: GenerateReadingFeedbackInputSchema },
  output: { schema: GenerateReadingFeedbackOutputSchema },
  prompt: `You are a supportive and encouraging literacy coach for young students in India.

  Your task is to analyze a student's reading of a passage and provide instant, helpful feedback in {{{language}}}.

  First, compare the student's transcript with the original passage. Identify any differences, such as missed words, mispronounced words, or hesitations.

  Then, generate feedback that includes:
  1.  **Appreciation:** Start with positive reinforcement. Mention something the student did well (e.g., "Great job reading so clearly!" or "You read that sentence with wonderful expression!").
  2.  **Areas for Improvement:** Gently point out 1-2 specific areas for improvement. Be constructive and focus on helping them. For example, instead of saying "You said this word wrong," say "This word, 'example', can be a little tricky. Let's try it together: ex-am-ple." or "I noticed you paused here, which is perfectly okay! Taking a breath can help with fluency."
  3.  **Encouragement:** End with an encouraging note to motivate them to keep practicing.

  Keep the feedback simple, positive, and easy for a young student to understand. Format the feedback as a markdown list.

  Original Passage:
  ---
  {{{passage}}}
  ---

  Student's Reading Transcript:
  ---
  {{{studentTranscript}}}
  ---

  Language for Feedback: {{{language}}}
  `,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  },
});

const generateReadingFeedbackFlow = ai.defineFlow(
  {
    name: 'generateReadingFeedbackFlow',
    inputSchema: GenerateReadingFeedbackInputSchema,
    outputSchema: GenerateReadingFeedbackOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
