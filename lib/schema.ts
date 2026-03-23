import { z } from 'zod';

export const requestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  modelId: z.string().optional(),
});

export type RequestBody = z.infer<typeof requestSchema>;
