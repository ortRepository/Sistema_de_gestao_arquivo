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
// Validation schemas
export const editSchema = z.object({
  budgetYear: z
    .string()
    .nonempty({ message: "Ano do orçamento é obrigatório" }),
  idDepartment: z.number().min(1, { message: "Departamento é obrigatório" }),
  idTimeline: z.number().min(1, { message: "Linha do tempo é obrigatória" }),
});

export const commentSchema = z.object({
  comment: z.string().nonempty({ message: "Comentário é obrigatório" }),
});

// Placeholder schemas (adjust as needed based on actual requirements)
export const payCostSchema = z.object({
  value: z.number().min(0, "O valor deve ser maior ou igual a zero"),
  justification: z.string().min(1, "A justificação é obrigatória"),
});

export const costSchema = z.object({
  idCostCenter: z.number().min(1, "O centro de custo é obrigatório"),
});

export const createCostSchema = z.object({
  value: z.number().positive("O valor deve ser maior que zero"),
  justification: z.string().min(1, "A justificação é obrigatória"),
  idCostCenter: z.number().positive("Selecione um centro de custo"),
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

// Zod schema for Section form
export const sectionSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  sectionNumber: z.number({
    invalid_type_error: "Número da seção deve ser um número",
  }),
  description: z.string().min(1, "Descrição é obrigatória"),
  idDirection: z
    .number({ invalid_type_error: "Direção é obrigatória" })
    .int()
    .min(1, "Direção é obrigatória"),
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

// Schema Zod
export const budgetControlSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
});
export const accountSchema = z.object({
  name: z
    .string()
    .min(1, "O nome da conta é obrigatório")
    .max(100, "O nome da conta deve ter no máximo 100 caracteres"),
  number: z
    .number()
    .int("O número da conta deve ser um inteiro")
    .positive("O número da conta deve ser positivo"),
  description: z
    .string()
    .min(1, "A descrição é obrigatória")
    .max(500, "A descrição deve ter no máximo 500 caracteres"),
  idClass: z.number().positive("A classe é obrigatória"),
});
export const classSchema = z.object({
  name: z
    .string()
    .min(1, "O nome da classe é obrigatório")
    .max(100, "O nome da classe deve ter no máximo 100 caracteres"),
  description: z
    .string()
    .min(1, "A descrição é obrigatória")
    .max(500, "A descrição deve ter no máximo 500 caracteres"),
  idBudgetControl: z.number().positive("O controle de orçamento é obrigatório"),
});

// Zod schemas for validation
export const createBudgetManagerSchema = z.object({
  idBudgetManager: z.number().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  role: z.string().min(1, "Papel é obrigatório"),
  idDepartment: z
    .number({ required_error: "Departamento é obrigatório" })
    .min(1, "Departamento é obrigatório"),
});

export const updateBudgetManagerSchema = z.object({
  idBudgetManager: z.number({ required_error: "ID é obrigatório" }),
  name: z.string().min(1, "Nome é obrigatório"),
  role: z.string().min(1, "Papel é obrigatório"),
  idDepartment: z
    .number({ required_error: "Departamento é obrigatório" })
    .min(1, "Departamento é obrigatório"),
  blocked: z.boolean(),
});
// Define cost center schema (adjust based on your actual schema)
export const costCenterSchema = z.object({
  idCostCenter: z.number().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  idAccount: z.number().min(1, "Selecione uma conta"),
});
export const licenseSchema = z.object({
  idBudgetManager: z.number().optional(),
  license: z.string().min(1, "Licença é obrigatória"),
  licenseNumber: z.string().min(1, "Número da licença é obrigatório"),
  licenseDate: z.string().min(1, "Data de emissão é obrigatória"),
  licenseExpirationDate: z.string().min(1, "Data de expiração é obrigatória"),
});



// Define the Zod schema for the form
export const timelineSchema = z.object({
  idTimeline: z.number().optional(),
  yearOfApplication: z
    .string()
    .nonempty("Ano de Aplicação é obrigatório")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Ano de Aplicação deve ser uma data válida",
    }),
  mapCreationDate: z
    .string()
    .nonempty("Data de Criação é obrigatória")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Data de Criação deve ser uma data válida",
    }),
  mapCompletionDate: z
    .string()
    .nonempty("Data de Conclusão é obrigatória")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Data de Conclusão deve ser uma data válida",
    }),
  mapCostAdditionDate: z
    .string()
    .nonempty("Data de Adição de Custos é obrigatória")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Data de Adição de Custos deve ser uma data válida",
    }),
  completionDateAdditionOfMapCost: z
    .string()
    .nonempty("Data de Conclusão de Adição de Custos é obrigatória")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Data de Conclusão de Adição de Custos deve ser uma data válida",
    }),
  mapCorrectionStartDate: z
    .string()
    .nonempty("Data de Início de Correção é obrigatória")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Data de Início de Correção deve ser uma data válida",
    }),
  endDateOfMapCorrection: z
    .string()
    .nonempty("Data de Fim de Correção é obrigatória")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Data de Fim de Correção deve ser uma data válida",
    }),
  mapExecutionStartDate: z
    .string()
    .nonempty("Data de Início de Execução é obrigatória")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Data de Início de Execução deve ser uma data válida",
    }),
  mapExecutionEndDate: z
    .string()
    .nonempty("Data de Fim de Execução é obrigatória")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Data de Fim de Execução deve ser uma data válida",
    }),

});