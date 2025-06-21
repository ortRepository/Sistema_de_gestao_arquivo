import { z } from 'zod';

class NotificationsSchemas {
  // Schema for a single notification (matches Prisma model exactly)
  static notification = z.object({
    idNotification: z.number({
      required_error: "O campo 'idNotification' é obrigatório.",
      invalid_type_error: "O campo 'idNotification' deve ser um número."
    }).int(),
    title: z.string({
      required_error: "O campo 'title' é obrigatório.",
      invalid_type_error: "O campo 'title' deve ser uma string."
    }).max(100),
    description: z.string({
      required_error: "O campo 'description' é obrigatório.",
      invalid_type_error: "O campo 'description' deve ser uma string."
    }).max(255),
    createdIn: z.string({
      required_error: "O campo 'createdIn' é obrigatório.",
      invalid_type_error: "O campo 'createdIn' deve ser uma string de data ISO 8601 válida."
    }).datetime(),
    read: z.boolean({
      required_error: "O campo 'read' é obrigatório.",
      invalid_type_error: "O campo 'read' deve ser um booleano."
    }),
    idUser: z.number({
      required_error: "O campo 'idUser' é obrigatório.",
      invalid_type_error: "O campo 'idUser' deve ser um número."
    }).int(),
    updatedIn: z.string({
      invalid_type_error: "O campo 'updatedIn' deve ser uma string de data ISO 8601 válida."
    }).datetime().nullable().optional()
  });

  // Schema for creating a notification
  static addNotification = z.object({
    title: z.string({
      required_error: "O campo 'title' é obrigatório.",
      invalid_type_error: "O campo 'title' deve ser uma string."
    }).min(1, "O título não pode estar vazio").max(100),
    description: z.string({
      required_error: "O campo 'description' é obrigatório.",
      invalid_type_error: "O campo 'description' deve ser uma string."
    }).min(1, "A descrição não pode estar vazia").max(255),
    idUser: z.number({
      required_error: "O campo 'idUser' é obrigatório.",
      invalid_type_error: "O campo 'idUser' deve ser um número."
    }).int().positive("O ID do usuário deve ser um inteiro positivo")
  });

  // Base schema for ID parameter (using idNotification)
  static idNotificationParam = z.object({
    idNotification: z.number({
      required_error: "O campo 'idNotification' é obrigatório.",
      invalid_type_error: "O campo 'idNotification' deve ser um número."
    }).int().positive("O ID da notificação deve ser um inteiro positivo")
  });

  // Success response schema
  static successResponse = z.object({
    message: z.string({
      required_error: "O campo 'message' é obrigatório.",
      invalid_type_error: "O campo 'message' deve ser uma string."
    }).min(1, "A mensagem não pode estar vazia")
  });

  // Schema for a list of notifications
  static notificationsList = z.array(this.notification);
  static token = z.object({
    token:z.string()
  })

  // Specific operation schemas (all using idNotification)
  static markAsRead = this.idNotificationParam;
  static deleteNotification = this.idNotificationParam;
  static getNotification = this.idNotificationParam;
}

export default NotificationsSchemas;