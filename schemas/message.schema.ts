import { z } from "zod";

export const MessageSchema = z.object({
    text: z.string().min(1, "Message cannot be empty").max(300, "Message cannot exceed 300 characters"),
});

export type Message = z.infer<typeof MessageSchema>;
