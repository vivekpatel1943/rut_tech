import { z } from "zod";

export const createGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Group name is required")
    .max(255, "Group name must be 255 characters or less"),
});

export const createItemSchema = z.object({
  group_id: z.string().uuid("Please select a valid group"),
  title: z
    .string()
    .trim()
    .max(255, "Title must be 255 characters or less")
    .optional()
    .nullable(),
  problem_url: z
    .string()
    .trim()
    .url("Please enter a valid URL (e.g. https://leetcode.com/problems/...)"),
  description: z.string().optional().nullable(),
  next_revision_at: z.string().datetime().optional().nullable(),
});

export const updateDescriptionSchema = z.object({
  description: z.string().nullable(),
});

