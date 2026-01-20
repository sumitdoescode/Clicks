import { z } from "zod";

export const PostSchema = z.object({
    caption: z.string("Caption cannot be empty").min(1, "Caption cannot be empty").max(300, "Caption cannot exceed 300 characters"),
});

export type Post = z.infer<typeof PostSchema>;
