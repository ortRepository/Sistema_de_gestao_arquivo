import { FastifyTypedInstance } from "../types/fastify_types";
import RoomsController from "../controllers/RoomsController";
import RoomsSchema from "../schemas/RoomsSchemas";
import ResponsesSchemas from "../schemas/ResponsesSchemas";
import type { FastifyReply } from "fastify";

export async function roomRoutes(app: FastifyTypedInstance) {
  const controller = new RoomsController();

  // Add room
  app.post(
    "/rooms",
    {
      schema: {
        description: "Add a new room",
        tags: ["Rooms"],
        body: RoomsSchema.roomInput,
        headers: RoomsSchema.token,
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

  // Update room
  app.put(
    "/rooms",
    {
      schema: {
        description: "Update a room",
        tags: ["Rooms"],
        body: RoomsSchema.roomInput,
        headers: RoomsSchema.token,
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

  // Delete room
  app.delete(
    "/rooms",
    {
      schema: {
        description: "Delete a room",
        tags: ["Rooms"],
        body: RoomsSchema.idRoom,
        headers: RoomsSchema.token,
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

  // View a room
  app.get(
    "/rooms/view-a",
    {
      schema: {
        description: "View a specific room",
        tags: ["Rooms"],
        headers: RoomsSchema.token,
        response: {
          200: RoomsSchema.room,
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

  // View all rooms
  app.get(
    "/rooms",
    {
      schema: {
        description: "View all rooms",
        tags: ["Rooms"],
        headers: RoomsSchema.token,
        response: {
          200: RoomsSchema.rooms,
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