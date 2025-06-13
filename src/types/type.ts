import { z } from "zod";

// Validação para Login
export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z
    .string()
    .nonempty("A senha é obrigatória")
    .max(30, "A senha deve ter no máximo 30 caracteres"),
});

// export const registerSchema = z
//   .object({
//     name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
//     email: z.string().email("E-mail inválido"),
//     password: z
//       .string()
//       .min(6, "A senha deve ter no mínimo 6 caracteres")
//       .max(16, "A senha deve ter no máximo 16 caracteres"),
//     confirmPassword: z.string(),
//     dateOfBirth: z
//       .string()
//       .regex(
//         /^\d{4}-\d{2}-\d{2}$/,
//         "Data de nascimento inválida (formato: YYYY-MM-DD)"
//       ),
//     gender: z.enum(["Masculino", "Feminino", "Outro"], {
//       errorMap: () => ({ message: "Selecione um gênero válido" }),
//     }),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "As senhas não coincidem",
//     path: ["confirmPassword"],
//   })
//   .refine(
//     (data) => {
//       const birthDate = new Date(data.dateOfBirth);
//       const now = new Date();
//       const twelveYearsAgo = new Date(
//         now.getFullYear() - 12,
//         now.getMonth(),
//         now.getDate()
//       );
//       return birthDate <= twelveYearsAgo;
//     },
//     {
//       message: "A idade mínima é 12 anos",
//       path: ["dateOfBirth"],
//     }
//   );

// Validação para Redefinir Senha
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "A senha deve ter no mínimo 6 caracteres")
      .max(16, "A senha deve ter no máximo 16 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

// Validação para Código de Confirmação
export const confirmationCodeSchema = z.object({
  code: z
    .string()
    .length(4, "O código deve ter exatamente 4 dígitos")
    .regex(/^\d+$/, "O código deve conter apenas números"),
});






// Campos Individuais Reutilizáveis
export const fields = {
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z
    .string()
    .min(6, "A senha deve ter no mínimo 6 caracteres")
    .max(16, "A senha deve ter no máximo 16 caracteres"),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data de nascimento inválida"),
  code: z
    .string()
    .length(4, "O código deve ter exatamente 4 dígitos")
    .regex(/^\d+$/, "O código deve conter apenas números"),
  description: z
    .string()
    .min(10, "A descrição deve ter pelo menos 10 caracteres"),
};

// Zod schema for validation
export const directionSchema = z.object({
  idDirection: z.number().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
});


// Zod schema for form validation
export const departmentSchema = z.object({
  name: z
    .string()
    .min(1, "O nome do departamento é obrigatório")
    .max(100, "O nome do departamento deve ter no máximo 100 caracteres"),
  description: z
    .string()
    .min(1, "A descrição é obrigatória")
    .max(500, "A descrição deve ter no máximo 500 caracteres"),
  departmentNumber: z
    .number()
    .int("O número do departamento deve ser um inteiro")
    .min(1, "O número do departamento deve superior a 0"),
  idSection: z.number(),
});


// Em src/types/type.ts
export const sendDocumentSchema = z.object({
  role: z.enum(["admin", "secretary"], { required_error: "Campo obrigatório" }),
  recipientId: z.string().min(1, "Selecione um destinatário"),
  message: z.string().min(6, "Digite ao menos 6 caracteres"),
});