import { z } from "zod";

export const createReviewSchema = z.object({
  product_id: z.string().uuid(),
  rating: z.number().int().min(1).max(10),
  comment: z.string().optional(),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(10).optional(),
  comment: z.string().optional(),
});
