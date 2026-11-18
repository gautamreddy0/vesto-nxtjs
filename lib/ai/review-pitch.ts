import { z } from 'zod';

import { generateJSON } from './gemini-client';
import { buildPitchReviewPrompt } from './prompts/fund-manager';

const criterionSchema = z.object({
  score: z.number().min(0).max(25),
  comment: z.string(),
});

const pitchReviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  score: z.number().min(0).max(100),
  feedback: z.string().trim().min(1),
  criteria: z.object({
    business_understanding: criterionSchema,
    financial_analysis: criterionSchema,
    risk_assessment: criterionSchema,
    investment_thesis: criterionSchema,
  }).optional(),
});

export type PitchReview = z.infer<typeof pitchReviewSchema>;

function parsePitchReview(result: unknown): PitchReview {
  const review = pitchReviewSchema.parse(result);
  return { ...review, status: review.score >= 70 ? 'approved' : 'rejected' };
}

export async function reviewPitch(
  companyName: string,
  symbol: string,
  pitch: string,
  companyData: string
): Promise<PitchReview> {
  const prompt = buildPitchReviewPrompt(companyName, symbol, pitch, companyData);
  const result = await generateJSON(prompt);
  return parsePitchReview(result);
}

