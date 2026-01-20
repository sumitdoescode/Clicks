import { z } from "zod";

export const CommentSchema = z.object({
    text: z.string().min(1, "Comment cannot be empty").max(300, "Comment cannot exceed 300 characters"),
});

type Comment = z.infer<typeof CommentSchema>;
