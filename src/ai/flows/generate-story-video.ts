
'use server';

/**
 * @fileOverview A Genkit flow for generating a video from a story.
 *
 * - generateStoryVideo - A function that handles the video generation process.
 * - GenerateStoryVideoInput - The input type for the generateStoryVideo function.
 * - GenerateStoryVideoOutput - The return type for the generateStoryVideo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {MediaPart} from 'genkit';

const GenerateStoryVideoInputSchema = z.object({
  story: z.string().describe('The story to generate a video from.'),
});
export type GenerateStoryVideoInput = z.infer<
  typeof GenerateStoryVideoInputSchema
>;

const GenerateStoryVideoOutputSchema = z.object({
  video: z
    .string()
    .describe(
      "A video of the story, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateStoryVideoOutput = z.infer<
  typeof GenerateStoryVideoOutputSchema
>;

async function downloadVideo(video: MediaPart): Promise<string> {
  const fetch = (await import('node-fetch')).default;
  // Add API key before fetching the video.
  const videoDownloadResponse = await fetch(
    `${video.media!.url}&key=${process.env.GEMINI_API_KEY}`
  );
  if (
    !videoDownloadResponse ||
    videoDownloadResponse.status !== 200 ||
    !videoDownloadResponse.body
  ) {
    throw new Error('Failed to fetch video');
  }

  const chunks = [];
  for await (const chunk of videoDownloadResponse.body) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('base64');
}

export const generateStoryVideo = ai.defineFlow(
  {
    name: 'generateStoryVideo',
    inputSchema: GenerateStoryVideoInputSchema,
    outputSchema: GenerateStoryVideoOutputSchema,
  },
  async (input: GenerateStoryVideoInput): Promise<GenerateStoryVideoOutput> => {
    let {operation} = await ai.generate({
      model: 'googleai/veo-2.0-generate-001',
      prompt: `A video illustrating the following story: ${input.story}`,
      config: {
        durationSeconds: 5,
        aspectRatio: '16:9',
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        ],
      },
    });

    if (!operation) {
      throw new Error('Expected the model to return an operation');
    }

    // Wait until the operation completes. Note that this may take some time, maybe even up to a minute. Design the UI accordingly.
    while (!operation.done) {
      operation = await ai.checkOperation(operation);
      // Sleep for 5 seconds before checking again.
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    if (operation.error) {
      throw new Error('failed to generate video: ' + operation.error.message);
    }

    const video = operation.output?.message?.content.find(p => !!p.media);
    if (!video) {
      throw new Error('Failed to find the generated video');
    }

    const videoBase64 = await downloadVideo(video);
    return {video: `data:video/mp4;base64,${videoBase64}`};
  }
);

