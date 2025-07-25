'use server';
/**
 * @fileOverview A Genkit flow for managing the student roster using tools.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AddStudentInputSchema = z.object({
  name: z.string().describe('The full name of the student.'),
  grade: z.string().describe('The grade or class of the student (e.g., "1", "2", "3").'),
  notes: z.string().optional().describe('Initial notes or observations about the student.'),
});

const AddSubjectToStudentInputSchema = z.object({
    studentName: z.string().describe("The name of the student to add the subject to."),
    subject: z.string().describe("The name of the subject (e.g., 'Maths', 'English')."),
    gpa: z.number().describe("The GPA the student received in the subject (0.0 to 5.0)."),
});

const RemoveStudentInputSchema = z.object({
    name: z.string().describe('The full name of the student to remove.'),
});


export const addStudentTool = ai.defineTool(
    {
        name: 'addStudent',
        description: 'Add a new student to the roster. Translates the name into multiple languages.',
        inputSchema: AddStudentInputSchema,
        outputSchema: z.string(),
    },
    async (input) => {
        return `Added new student: ${input.name} in Grade ${input.grade}. Notes: ${input.notes || 'None'}`;
    }
);

export const addSubjectToStudentTool = ai.defineTool(
    {
        name: 'addSubjectToStudent',
        description: "Add a subject and GPA for an existing student.",
        inputSchema: AddSubjectToStudentInputSchema,
        outputSchema: z.string(),
    },
    async (input) => {
        return `Added subject ${input.subject} with GPA ${input.gpa} for student ${input.studentName}.`;
    }
);


export const removeStudentTool = ai.defineTool(
  {
    name: 'removeStudent',
    description: 'Remove a student from the roster.',
    inputSchema: RemoveStudentInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    return `Removed student: ${input.name}.`;
  }
);


const ManageStudentFlowInputSchema = z.object({
  query: z.string(),
});
export type ManageStudentFlowInput = z.infer<typeof ManageStudentFlowInputSchema>;


const ManageStudentFlowOutputSchema = z.object({
    toolOutputs: z.array(z.any()).optional().describe("The direct output from any tools that were called."),
    response: z.string().describe("A conversational response confirming the action taken."),
});
export type ManageStudentFlowOutput = z.infer<typeof ManageStudentFlowOutputSchema>;


const manageStudentFlowPrompt = ai.definePrompt({
    name: 'manageStudentFlowPrompt',
    input: { schema: ManageStudentFlowInputSchema },
    output: { schema: ManageStudentFlowOutputSchema },
    tools: [addStudentTool, addSubjectToStudentTool, removeStudentTool],
    prompt: `You are a student management assistant. Use the available tools to add, edit, or remove students based on the user's query.

    Query: {{{query}}}
    `,
});


export async function manageStudentFlow(input: ManageStudentFlowInput): Promise<ManageStudentFlowOutput> {
    const { output } = await manageStudentFlowPrompt(input);
    return output!;
}
