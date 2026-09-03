import { z } from 'zod'

const emailField = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address'))

export const registerSchema = z.object({
    email: emailField,
    password: z
        .string()
        .min(8,'Password must be at least 8 characters')
        .max(72,'Password must be at most 72 characters')
        .regex(/[a-z]/, 'Password must contain a lowercase letter')
        .regex(/[A-Z]/, 'Password must contain an uppercase letter')
        .regex(/[0-9]/, 'Password must contain a number'),
    name: z.string().trim().min(1).max(80).optional()
})

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
