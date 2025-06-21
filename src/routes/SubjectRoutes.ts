import { FastifyTypedInstance } from "../types/fastify_types";
import SubjectsController from "../controllers/SubjectsController";
import SubjectsSchema from "../schemas/SubjectsSchemas";
import ResponsesSchemas from "../schemas/ResponsesSchemas";
import type { FastifyReply } from "fastify";

export async function subjectRoutes(app: FastifyTypedInstance) {
  const controller = new SubjectsController();

  // Register subject
  app.post(
    "/subjects",
    {
      schema: {
        description: "Register a new subject",
        tags: ["Subjects"],
        body: SubjectsSchema.subjectInput,
        headers: SubjectsSchema.token,
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

  // Delete subject
  app.delete(
    "/subjects",
    {
      schema: {
        description: "Delete a subject",
        tags: ["Subjects"],
        body: SubjectsSchema.idSubject,
        headers: SubjectsSchema.token,
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

  // Update subject
  app.put(
    "/subjects",
    {
      schema: {
        description: "Update a subject",
        tags: ["Subjects"],
        body: SubjectsSchema.subjectInput,
        headers: SubjectsSchema.token,
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

  // View a subject
  app.get(
    "/subjects/view-a",
    {
      schema: {
        description: "View a specific subject",
        tags: ["Subjects"],
        headers: SubjectsSchema.token,
        response: {
          200: SubjectsSchema.subject,
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

  // View all subjects
  app.get(
    "/subjects",
    {
      schema: {
        description: "View all subjects",
        tags: ["Subjects"],
        headers: SubjectsSchema.token,
        response: {
          200: SubjectsSchema.subjects,
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