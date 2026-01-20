import { z } from "zod";

export const UserSchema = z.object({
    name: z.string().min(3, "Name must be at least of 3 characters").max(25, "Name can't be more than 25 characters"),

    username: z
        .string()
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
        .min(3, "Username must be at least of 3 characters")
        .max(20, "Username can't be more than 20 characters"),

    bio: z.string().min(5, "Bio must be at least of 5 characters").max(100, "Bio can't be more than 100 characters").optional(),

    image: z
        .instanceof(File)
        .refine((file) => file.size <= 5 * 1024 * 1024, "Image size cannot exceed 5MB")
        .refine((file) => ["image/jpeg", "image/jpg", "image/png"].includes(file.type), "Only .jpg, .jpeg and .png formats are supported")
        .optional(),
});

export type User = z.infer<typeof UserSchema>;
