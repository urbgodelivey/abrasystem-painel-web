import { z } from 'zod';

// ── Login ─────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  remember: z.boolean().optional().default(false),
});

export type LoginFormData = z.infer<typeof loginSchema>;
