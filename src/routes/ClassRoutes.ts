import { FastifyTypedInstance } from "../types/fastify_types";
import ClassesController from "../controllers/ClassesController";
import ClassesSchema from "../schemas/ClassesSchemas";
import ResponsesSchemas from "../schemas/ResponsesSchemas";
import type { FastifyReply } from "fastify";

export async function classRoutes(app: FastifyTypedInstance) {
  const controller = new ClassesController();

  // Add class
  app.post(
    "/classes",
    {
      schema: {
        description: "Add a new class",
        tags: ["Classes"],
        body: ClassesSchema.classInput,
        headers: ClassesSchema.token,
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
      return reply.status(200).send(await controller.add(request.body, request.headers));
    }
  );

  // Delete class
  app.delete(
    "/classes",
    {
      schema: {
        description: "Delete a class",
        tags: ["Classes"],
        body: ClassesSchema.idClasse,
        headers: ClassesSchema.token,
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

  // Edit class
  app.put(
    "/classes",
    {
      schema: {
        description: "Edit a class",
        tags: ["Classes"],
        body: ClassesSchema.classInput,
        headers: ClassesSchema.token,
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
      return reply.status(200).send(await controller.edit(request.body, request.headers));
    }
  );

  // View a class
  app.get(
    "/classes/view-a",
    {
      schema: {
        description: "View a specific class",
        tags: ["Classes"],
        headers: ClassesSchema.token,
        response: {
          200: ClassesSchema.class,
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

  // View all classes
  app.get(
    "/classes",
    {
      schema: {
        description: "View all classes",
        tags: ["Classes"],
        headers: ClassesSchema.token,
        response: {
          200: ClassesSchema.classes,
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