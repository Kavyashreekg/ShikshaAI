'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/design-visual-aid.ts';
import '@/ai/flows/generate-localized-story.ts';
import '@/ai/flows/instant-knowledge-explanation.ts';
import '@/ai/flows/create-differentiated-worksheet.ts';
import '@/ai/flows/generate-story-video.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/speech-to-text.ts';
import '@/ai/flows/generate-student-suggestions.ts';
import '@/ai/flows/translate-text.ts';
import '@/ai/flows/manage-student-flow.ts';
import '@/ai/flows/generate-reading-assessment.ts';
import '@/ai/flows/generate-reading-feedback.ts';
import '@/ai/flows/generate-lesson-plan.ts';
import '@/ai/flows/sahayak-bot-flow.ts';
