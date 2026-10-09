import { z } from 'zod';

export const feedQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  cursor: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const watchProgressSchema = z.object({
  lastPositionSeconds: z.number().int().nonnegative(),
  durationSeconds: z.number().int().nonnegative(),
  completed: z.boolean().optional(),
});

export const watchInteractionSchema = z.object({
  isLiked: z.boolean().optional(),
  isSaved: z.boolean().optional(),
});

export const createWatchCommentSchema = z.object({
  content: z.string().min(1).max(2000),
  parentId: z.string().uuid().optional(),
});

export type FeedQueryDto = z.infer<typeof feedQuerySchema>;
export type WatchProgressDto = z.infer<typeof watchProgressSchema>;
export type WatchInteractionDto = z.infer<typeof watchInteractionSchema>;
export type CreateWatchCommentDto = z.infer<typeof createWatchCommentSchema>;
