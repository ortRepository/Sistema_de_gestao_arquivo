import { FastifyTypedInstance } from "../types/fastify_types";
import UsersController from "../controllers/UsersController";
import UserSchema from "../schemas/UsersSchemas";
import ResponsesSchemas from "../schemas/ResponsesSchemas";
import type { FastifyReply } from "fastify";


export async function userRoutes(app: FastifyTypedInstance) {
  const controller = new UsersController();

  // Register user
  app.post(
    "/users/register",
    {
      schema: {
        description: "Register a new user",
        tags: ["Users"],
        body: UserSchema.registerUser,
        response: {
          200: UserSchema.authenticateResponse,
          400: ResponsesSchemas.error_400_response,
          403: ResponsesSchemas.general_error_response,
          409: ResponsesSchemas.general_error_response,
          500: ResponsesSchemas.general_error_response,
        },
      },
    },
    async (request, reply) => {
      return reply.status(200).send(await controller.register(request.body));
    }
  );

  // Authenticate user
  app.post(
    "/users/authenticate",
    {
      schema: {
        description: "Authenticate user",
        tags: ["Users"],
        body: UserSchema.authenticateUser,
        response: {
          200: UserSchema.authenticateResponse,
          400: ResponsesSchemas.error_400_response,
          401: ResponsesSchemas.general_error_response,
          404: ResponsesSchemas.general_error_response,
          500: ResponsesSchemas.general_error_response,
        },
      },
    },
    async (request, reply) => {
      return reply.status(200).send(await controller.authenticate(request.body));
    }
  );

  // Receive authentication code
  app.post(
    "/users/receive-code",
    {
      schema: {
        description: "Receive authentication code",
        tags: ["Users"],
        body: UserSchema.receiveCode,
        response: {
          200: ResponsesSchemas.success_response,
          400: ResponsesSchemas.error_400_response,
          500: ResponsesSchemas.general_error_response,
        },
      },
    },
    async (request, reply) => {
      return reply.status(200).send(await controller.receive_code(request.body));
    }
  );

  // Recover password
  app.post(
    "/users/recover-password",
    {
      schema: {
        description: "Update password using code",
        tags: ["Users"],
        body: UserSchema.recoveryPassword,
        response: {
          200: ResponsesSchemas.success_response,
          400: ResponsesSchemas.error_400_response,
          403: ResponsesSchemas.general_error_response,
          404: ResponsesSchemas.general_error_response,
          500: ResponsesSchemas.general_error_response,
        },
      },
    },
    async (request, reply) => {
      return reply.status(200).send(await controller.updatePasswordWithCode(request.body));
    }
  );

  // Change email
  app.patch(
    "/users/change-email",
    {
      schema: {
        description: "Change user email",
        tags: ["Users"],
        body: UserSchema.changeEmail,
        headers: UserSchema.token,
        response: {
          200: ResponsesSchemas.success_response,
          400: ResponsesSchemas.error_400_response,
          401: ResponsesSchemas.general_error_response,
          404: ResponsesSchemas.general_error_response,
          409: ResponsesSchemas.general_error_response,
          500: ResponsesSchemas.general_error_response,
        },
      },
    },
    async (request, reply) => {
      return reply.status(200).send(await controller.changeEmail(request.body, request.headers));
    }
  );

  // Edit password
  app.patch(
    "/users/password-edit",
    {
      schema: {
        description: "Edit user password",
        tags: ["Users"],
        body: UserSchema.changePassword,
        headers: UserSchema.token,
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
      return reply.status(200).send(await controller.password_edit(request.body, request.headers))
    }
  );

  // Update user
  app.put(
    "/users/update",
    {
      schema: {
        description: "Update user information",
        tags: ["Users"],
        body: UserSchema.updateUser,
        headers: UserSchema.token,
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
      return reply.status(200).send(await controller.update(request.body, request.headers))
    }
  );

  // Delete user
  app.delete(
    "/users",
    {
      schema: {
        description: "Delete user account",
        tags: ["Users"],
        body: UserSchema.idUser,
        headers: UserSchema.token,
        response: {
          200: ResponsesSchemas.success_response,
          400: ResponsesSchemas.error_400_response,
          401: ResponsesSchemas.general_error_response,
          403: ResponsesSchemas.general_error_response,
          404: ResponsesSchemas.general_error_response,
          500: ResponsesSchemas.general_error_response,
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const validBody = UserSchema.idUser.parse(request.body)
      const validToken = UserSchema.token.parse(request.headers)
      return reply.status(200).send(await controller.delete(validBody, validToken));
    }
  );

  // View single user
  app.get(
    "/users/view-a",
    {
      schema: {
        description: "View user information",
        tags: ["Users"],
        headers: UserSchema.token,
        response: {
          200: UserSchema.user,
          400: ResponsesSchemas.error_400_response,
          401: ResponsesSchemas.general_error_response,
          404: ResponsesSchemas.general_error_response,
          500: ResponsesSchemas.general_error_response,
        },
      },
    },
    async (request, reply) => {
      return reply.status(200).send(await controller.viewA(request.headers, request));
    }
  );

  // View all users
  app.get(
    "/users",
    {
      schema: {
        description: "View all users",
        tags: ["Users"],
        headers: UserSchema.token,
        response: {
          200: UserSchema.users,
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

  // Upload user photo
  app.patch(
    "/users/upload-photo",
    {
      schema: {
        description: "Upload user photo",
        tags: ["Users"],
        headers: UserSchema.token,
        consumes: ["multipart/form-data"],
        response: {
          200: UserSchema.uploadPhotoResponse,
          400: ResponsesSchemas.error_400_response,
          401: ResponsesSchemas.general_error_response,
          500: ResponsesSchemas.general_error_response,
        },
      },
    },
    async (request, reply) => {
        const file = await request.file();
        return reply.status(200).send(await controller.uploadPhoto(request.headers, file, request));
      
    }
  );
}