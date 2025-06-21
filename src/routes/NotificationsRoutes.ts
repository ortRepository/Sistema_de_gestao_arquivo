import { FastifyTypedInstance } from "../types/fastify_types";
import NotificationsController from "../controllers/NotificationsController";
import NotificationsSchemas from "../schemas/NotificationsSchemas";
import ResponsesSchemas from "../schemas/ResponsesSchemas";
import type { FastifyReply } from "fastify";

export async function notificationsRoutes(app: FastifyTypedInstance) {
  const controller = new NotificationsController();

  // Get all notifications
  app.get(
    "/notifications",
    {
      schema: {
        description: "Obter todas as notificações do usuário autenticado",
        tags: ["Notifications"],
        headers: NotificationsSchemas.token,
        response: {
          200: NotificationsSchemas.notificationsList,
          400: ResponsesSchemas.error_400_response,
          401: ResponsesSchemas.general_error_response,
          500: ResponsesSchemas.general_error_response,
        },
      },
    },
    async (request, reply) => {
      const validatedToken = NotificationsSchemas.token.parse(request.headers);
      const response = await controller.viewAll(validatedToken);
      return reply.status(200).send(response);
    }
  );

  // Get a specific notification
  app.get(
    "/notifications/:idNotification",
    {
      schema: {
        description: "Obter uma notificação específica",
        tags: ["Notifications"],
        params: NotificationsSchemas.getNotification,
        headers: NotificationsSchemas.token,
        response: {
          200: NotificationsSchemas.notification,
          400: ResponsesSchemas.error_400_response,
          401: ResponsesSchemas.general_error_response,
          404: ResponsesSchemas.general_error_response,
          500: ResponsesSchemas.general_error_response,
        },
      },
    },
    async (request, reply) => {
      const validatedParams = NotificationsSchemas.getNotification.parse(request.params);
      const validatedHeaders = NotificationsSchemas.token.parse(request.headers);
      const response = await controller.viewA(validatedParams, validatedHeaders);
      return reply.status(200).send(response);
    }
  );

  // Mark notification as read
  app.patch(
    "/notifications/:idNotification/read",
    {
      schema: {
        description: "Marcar notificação como lida",
        tags: ["Notifications"],
        params: NotificationsSchemas.markAsRead,
        headers: NotificationsSchemas.token,
        response: {
          200: NotificationsSchemas.successResponse,
          400: ResponsesSchemas.error_400_response,
          401: ResponsesSchemas.general_error_response,
          404: ResponsesSchemas.general_error_response,
          500: ResponsesSchemas.general_error_response,
        },
      },
    },
    async (request, reply) => {
      const validatedParams = NotificationsSchemas.markAsRead.parse(request.params);
      const validatedHeaders = NotificationsSchemas.token.parse(request.headers);
      const response = await controller.read(validatedParams, validatedHeaders);
      return reply.status(200).send(response);
    }
  );

  // Delete a notification
  app.delete(
    "/notifications/:idNotification",
    {
      schema: {
        description: "Excluir uma notificação",
        tags: ["Notifications"],
        params: NotificationsSchemas.deleteNotification,
        headers: NotificationsSchemas.token,
        response: {
          200: NotificationsSchemas.successResponse,
          400: ResponsesSchemas.error_400_response,
          401: ResponsesSchemas.general_error_response,
          404: ResponsesSchemas.general_error_response,
          500: ResponsesSchemas.general_error_response,
        },
      },
    },
    async (request, reply) => {
      const validatedParams = NotificationsSchemas.deleteNotification.parse(request.params);
      const validatedHeaders = NotificationsSchemas.token.parse(request.headers);
      const response = await controller.delete(validatedParams, validatedHeaders);
      return reply.status(200).send(response);
    }
  );
}