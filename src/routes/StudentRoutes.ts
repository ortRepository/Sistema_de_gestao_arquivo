import { FastifyTypedInstance } from "../types/fastify_types";
import StudentsController from "../controllers/StudentsController";
import StudentsSchema from "../schemas/StudentsSchemas";
import ResponsesSchemas from "../schemas/ResponsesSchemas";
import type { FastifyReply } from "fastify";

export async function studentRoutes(app: FastifyTypedInstance) {
  const controller = new StudentsController();

  // Register student
  app.post(
    "/students",
    {
      schema: {
        description: "Register a new student",
        tags: ["Students"],
        body: StudentsSchema.studentInput,
        headers: StudentsSchema.token,
        response: {
          200: ResponsesSchemas.success_response,
          400: ResponsesSchemas.error_400_response,
          401: ResponsesSchemas.general_error_response,
          404: ResponsesSchemas.general_error_response,
          500: ResponsesSchemas.general_error_response,
        },
      },
    },
    async (request, reply) => {
      return reply.status(200).send(await controller.register(request.body, request.headers));
    }
  );

  // Update student
  app.put(
    "/students",
    {
      schema: {
        description: "Update a student",
        tags: ["Students"],
        body: StudentsSchema.studentInput,
        headers: StudentsSchema.token,
        response: {
          200: ResponsesSchemas.success_response,
          400: ResponsesSchemas.error_400_response,
          401: ResponsesSchemas.general_error_response,
          404: ResponsesSchemas.general_error_response,
          500: ResponsesSchemas.general_error_response,
        },
      },
    },
    async (request, reply) => {
      return reply.status(200).send(await controller.update(request.body, request.headers));
    }
  );

  // Delete student
  app.delete(
    "/students",
    {
      schema: {
        description: "Delete a student",
        tags: ["Students"],
        body: StudentsSchema.idStudent,
        headers: StudentsSchema.token,
        response: {
          200: ResponsesSchemas.success_response,
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

  // View a student
  app.get(
    "/students/view-a",
    {
      schema: {
        description: "View a specific student",
        tags: ["Students"],
        headers: StudentsSchema.token,
        response: {
          200: StudentsSchema.student,
          400: ResponsesSchemas.error_400_response,
          401: ResponsesSchemas.general_error_response,
          404: ResponsesSchemas.general_error_response,
          500: ResponsesSchemas.general_error_response,
        },
      },
    },
    async (request, reply) => {
      return reply.status(200).send(await controller.viewA(request.headers));
    }
  );

  // View all students
  app.get(
    "/students",
    {
      schema: {
        description: "View all students",
        tags: ["Students"],
        headers: StudentsSchema.token,
        response: {
          200: StudentsSchema.students,
          400: ResponsesSchemas.error_400_response,
          401: ResponsesSchemas.general_error_response,
          500: ResponsesSchemas.general_error_response,
        },
      },
    },
    async (request, reply) => {
      return reply.status(200).send(await controller.viewAll(request.headers));
    }
  );
}