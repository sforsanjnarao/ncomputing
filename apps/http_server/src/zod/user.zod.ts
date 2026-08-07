import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2, "Please enter your name."),
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  phone: z.string().optional(),
  organization: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(1, "Please enter your password."),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
