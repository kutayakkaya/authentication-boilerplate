import { z } from "zod";

const emailSchema = z
    .email({ message: "Please enter a valid email address." })
    .min(1, "Email is required.")
    .max(120, "Email cannot be longer than 120 characters.");

const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .max(64, "Password cannot be longer than 64 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number.");

const registerSchema = z.object({
    email: emailSchema,
    password: passwordSchema
});

const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required.")
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export { registerSchema, loginSchema };
