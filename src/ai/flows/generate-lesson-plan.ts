
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a weekly lesson plan based on a topic.
 *
 * - generateLessonPlan - A function that generates a lesson plan.
 * - GenerateLessonPlanInput - The input type for the generateLessonPlan function.
 * - GenerateLessonPlanOutput - The return type for the generateLessonPlanOutput function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLessonPlanInputSchema = z.object({
  grade: z.string().describe("The grade level for the lesson plan."),
  subject: z.string().describe('The subject of the lesson plan.'),
  lessonName: z.string().describe('The name or topic of the lesson.'),
});
export type GenerateLessonPlanInput = z.infer<typeof GenerateLessonPlanInputSchema>;

const GenerateLessonPlanOutputSchema = z.object({
  lessonPlanContent: z.string().describe('The generated weekly lesson plan content, formatted in Markdown.'),
});
export type GenerateLessonPlanOutput = z.infer<typeof GenerateLessonPlanOutputSchema>;


export async function generateLessonPlan(input: GenerateLessonPlanInput): Promise<GenerateLessonPlanOutput> {
  return generateLessonPlanFlow(input);
}


const generateLessonPlanPrompt = ai.definePrompt({
  name: 'generateLessonPlanPrompt',
  input: {schema: GenerateLessonPlanInputSchema},
  output: {schema: GenerateLessonPlanOutputSchema},
  prompt: `You are an expert curriculum designer for Indian schools. Your task is to create a comprehensive, engaging, and practical weekly lesson plan based on the provided topic.

  The lesson plan should be structured logically for a week of teaching. It must be written in simple, clear language.

  **Lesson Details:**
  - **Lesson Name/Topic:** {{{lessonName}}}
  - **Grade Level:** {{{grade}}}
  - **Subject:** {{{subject}}}

  **Instructions:**
  Based on the provided details, generate a weekly lesson plan. The plan should include the following sections, formatted clearly using Markdown:

  1.  **Learning Objectives:** List 2-3 clear and measurable learning outcomes for the week.
  2.  **Day-wise Breakdown:** Provide a plan for 5 days of the week (Day 1 to Day 5).
      - For each day, include:
          - A brief **Topic/Sub-topic**.
          - A **Class Activity** (e.g., discussion, group work, experiment, reading).
          - A **Blackboard Work** suggestion (key points, diagrams, questions to write on the board).
  3.  **Materials Required:** List any simple, commonly available materials needed for the week's activities.
  4.  **Assessment/Homework:** Suggest a simple way to assess student understanding at the end of the week (e.g., a short quiz, a worksheet, a presentation).

  Ensure the entire output is a single Markdown string.
  `,
});

const generateLessonPlanFlow = ai.defineFlow(
  {
    name: 'generateLessonPlanFlow',
    inputSchema: GenerateLessonPlanInputSchema,
    outputSchema: GenerateLessonPlanOutputSchema,
  },
  async input => {
    const {output} = await generateLessonPlanPrompt(input);
    return output!;
  }
);
