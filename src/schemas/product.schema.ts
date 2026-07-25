import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1),
  brand: z.string().min(1),
  flavor: z.string().min(1),
  category: z.string().min(1),
  description: z.string().optional(),
  product_url: z.string().url().optional(),
  image_url: z.string().url().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  brand: z.string().min(1).optional(),
  flavor: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  description: z.string().optional(),
  product_url: z.string().url().optional(),
  image_url: z.string().url().optional(),
});
