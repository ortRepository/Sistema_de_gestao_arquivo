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

export const studentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  biNumber: z.string().min(1, "Número do BI é obrigatório"),
  room: z.string().min(1, "Sala é obrigatória"),
  plainToClassFromExist: z.string().min(1, "Turma é obrigatória"),
  dateOfBirth: z.string().min(1, "Data de nascimento é obrigatória"),
  idClass: z.number().min(1, "Classe é obrigatória"),
});

// Zod schema for form validation (excluding photo and path)
export const teacherSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  telephone: z.string().min(1, "Telefone é obrigatório"),
  role: z.enum(["Professor", "Coordenador"]),
  function: z.string().min(1, "Função é obrigatória"),
  status: z.enum(["Ativo", "Inativo"], {
    errorMap: () => ({ message: "Status é obrigatório" }),
  }),
});

export const classSchema = z.object({
  name: z.string().trim().min(1, "Nome da turma é obrigatório"),
  status: z.boolean(),
  idRoom: z
    .number()
    .positive("Sala deve ser um número positivo")
    .int("Sala deve ser um número inteiro"),
});

export const courseSchema = z.object({
  name: z.string().trim().min(1, "Nome do curso é obrigatório"),
  status: z.boolean(),
});

export const subjectSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Nome da disciplina é obrigatório" })
    .max(100, {
      message: "Nome da disciplina deve ter no máximo 100 caracteres",
    }),
  course: z
    .string()
    .min(1, { message: "Curso é obrigatório" })
    .refine((value) => !isNaN(parseInt(value)), {
      message: "Curso deve ser um ID válido",
    }),
  status: z.enum(["true", "false"], {
    errorMap: () => ({
      message: "Status deve ser 'Ativo' ou 'Inativo'",
    }),
  }),
});

// Zod Schema for Room validation
export const roomSchema = z.object({
  name: z.string().min(1, "Nome da sala é obrigatório"),
  status: z.boolean(),
  idCourse: z.number().min(1, "Curso é obrigatório"),
});
