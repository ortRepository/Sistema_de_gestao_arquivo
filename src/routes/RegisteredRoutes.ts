import { FastifyTypedInstance } from "../types/fastify_types";
import RegisteredController from "../controllers/RegisteredController";
import RegisteredSchemas from "../schemas/RegisteredSchemas";
import ResponsesSchemas from "../schemas/ResponsesSchemas";
import type { FastifyReply } from "fastify";

export async function registeredRoutes(app: FastifyTypedInstance) {
  const controller = new RegisteredController();

  // Add a new registered entry
  app.post(
    "/registered/add",
    {
      schema: {
        description: "Add a new registered entry",
        tags: ["Registered"],
        body: RegisteredSchemas.addRegistered,
        headers: RegisteredSchemas.token,
        response: {
          200: RegisteredSchemas.successResponse,
          400: ResponsesSchemas.error_400_response,
          401: ResponsesSchemas.general_error_response,
          500: ResponsesSchemas.general_error_response,
        },
      },
    },
    async (request, reply) => {
      const validBody = RegisteredSchemas.addRegistered.parse(request.body);
      const validToken = RegisteredSchemas.token.parse(request.headers);
      return reply.status(200).send(await controller.add(validBody, validToken));
    }
  );

  // Delete a registered entry
  app.delete(
    "/registered",
    {
      schema: {
        description: "Delete a registered entry",
        tags: ["Registered"],
        body: RegisteredSchemas.deleteRegistered,
        headers: RegisteredSchemas.token,
        response: {
          200: RegisteredSchemas.successResponse,
          400: ResponsesSchemas.error_400_response,
          401: ResponsesSchemas.general_error_response,
          404: ResponsesSchemas.general_error_response,
          500: ResponsesSchemas.general_error_response,
        },
      },
    },
    async (request, reply) => {
      const validBody = RegisteredSchemas.deleteRegistered.parse(request.body);
      const validToken = RegisteredSchemas.token.parse(request.headers);
      return reply.status(200).send(await controller.delete(validBody, validToken));
    }
  );

  // View a single registered entry
  app.get(
    "/registered/:idRegistered",
    {
      schema: {
        description: "View a single registered entry",
        tags: ["Registered"],
        headers: RegisteredSchemas.token,
        params: RegisteredSchemas.viewRegistered,
        response: {
          200: RegisteredSchemas.registered,
          400: ResponsesSchemas.error_400_response,
          401: ResponsesSchemas.general_error_response,
          404: ResponsesSchemas.general_error_response,
          500: ResponsesSchemas.general_error_response,
        },
      },
    },
    async (request, reply) => {
      const validParams = RegisteredSchemas.viewRegistered.parse(request.params);
      const validToken = RegisteredSchemas.token.parse(request.headers);
      return reply.status(200).send(await controller.viewA(validParams, validToken));
    }
  );

  // View all registered entries
  app.get(
    "/registered",
    {
      schema: {
        description: "View all registered entries",
        tags: ["Registered"],
        headers: RegisteredSchemas.token,
        response: {
          200: RegisteredSchemas.registeredEntries,
          400: ResponsesSchemas.error_400_response,
          401: ResponsesSchemas.general_error_response,
          500: ResponsesSchemas.general_error_response,
        },
      },
    },
    async (request, reply) => {
      const validToken = RegisteredSchemas.token.parse(request.headers);
      return reply.status(200).send(await controller.viewAll(validToken));
    }
  );
}