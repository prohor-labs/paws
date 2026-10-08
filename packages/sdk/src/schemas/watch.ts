import { z } from "zod";

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
