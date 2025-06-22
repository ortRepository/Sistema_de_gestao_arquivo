import { FastifyTypedInstance } from "../types/fastify_types";
import TeachersController from "../controllers/TeachersController";
import TeachersSchemas from "../schemas/TeachersSchemas";
import ResponsesSchemas from "../schemas/ResponsesSchemas";
import type { FastifyReply } from "fastify";

export async function teacherRoutes(app: FastifyTypedInstance) {
  const controller = new TeachersController();

  // Add teacher
  app.post(
    "/teachers",
    {
      schema: {
        description: "Add a new teacher",
        tags: ["Teachers"],
        body: TeachersSchemas.addTeacher,
        headers: TeachersSchemas.token,
        response: {
          200: TeachersSchemas.successResponse,
          400: ResponsesSchemas.error_400_response,
          401: ResponsesSchemas.general_error_response,
          404: ResponsesSchemas.general_error_response,
          500: ResponsesSchemas.general_error_response,
        },
      },
    },
    async (request, reply) => {
      return reply.status(200).send(await controller.add(request.body, request.headers));
    }
  );

  // Delete teacher
  app.delete(
    "/teachers",
    {
      schema: {
        description: "Delete a teacher",
        tags: ["Teachers"],
        body: TeachersSchemas.deleteTeacher,
        headers: TeachersSchemas.token,
        response: {
          200: TeachersSchemas.successResponse,
          400: ResponsesSchemas.error_400_response,
          401: ResponsesSchemas.general_error_response,
          404: ResponsesSchemas.general_error_response,
          500: ResponsesSchemas.general_error_response,
        },
      },
    },
    async (request, reply) => {
      return reply.status(200).send(await controller.delete(request.body, request.headers));
    }
  );

  // View a teacher
  app.get(
    "/teachers/view-a",
    {
      schema: {
        description: "View a specific teacher",
        tags: ["Teachers"],
        params: TeachersSchemas.viewTeacher,
        headers: TeachersSchemas.token,
        response: {
          200: TeachersSchemas.teacher,
          400: ResponsesSchemas.error_400_response,
          401: ResponsesSchemas.general_error_response,
          404: ResponsesSchemas.general_error_response,
          500: ResponsesSchemas.general_error_response,
        },
      },
    },
    async (request, reply) => {
      return reply.status(200).send(await controller.viewA(request.params, request.headers));
    }
  );

  // View all teachers
  app.get(
    "/teachers",
    {
      schema: {
        description: "View all teachers",
        tags: ["Teachers"],
        headers: TeachersSchemas.token,
        response: {
          200: TeachersSchemas.teachers,
          400: ResponsesSchemas.error_400_response,
          401: ResponsesSchemas.general_error_response,
          500: ResponsesSchemas.general_error_response,
        },
      },
    },
    async (request, reply) => {
      return reply.status(200).send(await controller.viewAll( request.headers));
    }
  );
}