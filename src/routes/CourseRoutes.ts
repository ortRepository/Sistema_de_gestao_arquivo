import { FastifyTypedInstance } from "../types/fastify_types";
import CoursesController from "../controllers/CoursesController";
import CoursesSchema from "../schemas/CoursesSchemas";
import ResponsesSchemas from "../schemas/ResponsesSchemas";
import type { FastifyReply } from "fastify";

export async function courseRoutes(app: FastifyTypedInstance) {
  const controller = new CoursesController();

  // Add course
  app.post(
    "/courses",
    {
      schema: {
        description: "Add a new course",
        tags: ["Courses"],
        body: CoursesSchema.courseInput,
        headers: CoursesSchema.token,
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

  // Delete course
  app.delete(
    "/courses",
    {
      schema: {
        description: "Delete a course",
        tags: ["Courses"],
        body: CoursesSchema.idCourse,
        headers: CoursesSchema.token,
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

  // View a course
  app.get(
    "/courses/view-a",
    {
      schema: {
        description: "View a specific course",
        tags: ["Courses"],
        headers: CoursesSchema.token,
        response: {
          200: CoursesSchema.course,
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

  // View all courses
  app.get(
    "/courses",
    {
      schema: {
        description: "View all courses",
        tags: ["Courses"],
        headers: CoursesSchema.token,
        response: {
          200: CoursesSchema.courses,
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

  // Edit course
  app.put(
    "/courses",
    {
      schema: {
        description: "Edit a course",
        tags: ["Courses"],
        body: CoursesSchema.courseInput,
        headers: CoursesSchema.token,
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
}