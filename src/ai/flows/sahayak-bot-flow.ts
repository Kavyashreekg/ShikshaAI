'use server';
/**
 * @fileOverview A Genkit flow that acts as a general-purpose AI assistant (Sahayak Bot).
 * It uses other flows as tools to respond to user queries.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  instantKnowledgeExplanation
} from './instant-knowledge-explanation';
import {
  generateLocalizedStory,
} from './generate-localized-story';
import {
  designVisualAid,
} from './design-visual-aid';

import { InstantKnowledgeExplanationInputSchema, InstantKnowledgeExplanationOutputSchema, type InstantKnowledgeExplanationInput, type InstantKnowledgeExplanationOutput } from './schemas/instant-knowledge-explanation.schema';
import { GenerateLocalizedStoryInputSchema, GenerateLocalizedStoryOutputSchema, type GenerateLocalizedStoryInput, type GenerateLocalizedStoryOutput } from './schemas/generate-localized-story.schema';
import { DesignVisualAidInputSchema, DesignVisualAidOutputSchema, type DesignVisualAidInput, type DesignVisualAidOutput } from './schemas/design-visual-aid.schema';

// Tool for explaining concepts
const explainConceptTool = ai.defineTool(
  {
    name: 'explainConcept',
    description: 'Explains a concept in simple terms with an analogy. Use this for questions like "what is X?" or "explain Y".',
    inputSchema: InstantKnowledgeExplanationInputSchema,
    outputSchema: InstantKnowledgeExplanationOutputSchema,
  },
  async (input) => instantKnowledgeExplanation(input)
);

// Tool for generating stories
const createStoryTool = ai.defineTool(
  {
    name: 'createStory',
    description: 'Creates a hyper-localized and culturally relevant story for children on a given topic and language.',
    inputSchema: GenerateLocalizedStoryInputSchema,
    outputSchema: GenerateLocalizedStoryOutputSchema,
  },
  async (input) => generateLocalizedStory(input)
);

// Tool for designing visual aids
const createVisualAidTool = ai.defineTool(
  {
    name: 'createVisualAid',
    description: 'Generates a simple, clear visual aid (like a line drawing or chart) based on a description, suitable for a blackboard.',
    inputSchema: DesignVisualAidInputSchema,
    outputSchema: DesignVisualAidOutputSchema,
  },
  async (input) => designVisualAid(input)
);

const SahayakBotInputSchema = z.object({
  query: z.string().describe('The user query.'),
  language: z.string().describe('The language for the response, if applicable for the tool.'),
});
export type SahayakBotInput = z.infer<typeof SahayakBotInputSchema>;

// The output schema is a union of all possible tool outputs, plus a general text response.
const SahayakBotOutputSchema = z.object({
    explanation: InstantKnowledgeExplanationOutputSchema.optional(),
    story: GenerateLocalizedStoryOutputSchema.optional(),
    visualAid: DesignVisualAidOutputSchema.optional(),
    response: z.string().describe("A conversational response confirming the action taken or providing an answer if no specific tool was used."),
});
export type SahayakBotOutput = z.infer<typeof SahayakBotOutputSchema>;


const sahayakBotPrompt = ai.definePrompt({
  name: 'sahayakBotPrompt',
  system: "You are a versatile AI teaching assistant called Sahayak Bot. Your goal is to understand the user's request and use the appropriate tool to fulfill it. Determine the user's intent from their query. If the query is a request to explain something, use the `explainConcept` tool. If it's a request to create a story, use the `createStory` tool. If it's a request for a drawing or chart, use the `createVisualAid` tool. If none of the tools seem appropriate, provide a helpful text-based response. When using a tool, you still need to provide a conversational response.",
  tools: [explainConceptTool, createStoryTool, createVisualAidTool],
  input: { schema: SahayakBotInputSchema },
  output: { schema: SahayakBotOutputSchema },
  prompt: `Query: {{{query}}}
Language: {{{language}}}
`,
});

export async function sahayakBotFlow(input: SahayakBotInput): Promise<SahayakBotOutput> {
  const llmResponse = await sahayakBotPrompt(input);
  const toolCalls = llmResponse.toolCalls();

  if (toolCalls.length === 0) {
    return {
        response: llmResponse.text(),
    }
  }

  const toolResults = await Promise.all(
    toolCalls.map(async (toolCall) => {
        const toolResult = await toolCall.run();
        return {
            toolName: toolCall.name,
            output: toolResult.output
        };
    })
  );

  const finalOutput: SahayakBotOutput = { response: llmResponse.text() };

  toolResults.forEach(result => {
    if (result.toolName === 'explainConcept') {
        finalOutput.explanation = result.output as InstantKnowledgeExplanationOutput;
    } else if (result.toolName === 'createStory') {
        finalOutput.story = result.output as GenerateLocalizedStoryOutput;
    } else if (result.toolName === 'createVisualAid') {
        finalOutput.visualAid = result.output as DesignVisualAidOutput;
    }
  });
  
  return finalOutput;
}
