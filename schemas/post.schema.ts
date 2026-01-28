import { z } from "zod";

export const PostSchema = z.object({
    caption: z.string("Caption cannot be empty").min(1, "Caption cannot be empty").max(300, "Caption cannot exceed 300 characters"),
    image: z
        .instanceof(File, { message: "Image is required" })
        .refine((file) => file.size <= 5 * 1024 * 1024, "Image size cannot exceed 5MB")
        .refine((file) => ["image/jpeg", "image/jpg", "image/png"].includes(file.type), "Only .jpg, .jpeg and .png formats are supported"),
});

// when you are handling file upload you need to check file size and file type, so client don't abuse your server
export type Post = z.infer<typeof PostSchema>;

export const UpdatePostSchema = z.object({
    caption: z.string("Caption is required").min(1, "Caption cannot be empty").max(300, "Caption cannot exceed 300 characters"),
});

export type UpdatePost = z.infer<typeof UpdatePostSchema>;
