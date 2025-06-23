import { FastifyTypedInstance } from "../types/fastify_types";
import DocumentsController from "../controllers/DocumentsController";
import DocumentsSchemas from "../schemas/DocumentsSchemas";
import ResponsesSchemas from "../schemas/ResponsesSchemas";
import type { FastifyReply } from "fastify";
import DataExtracMultipart from "../utils/fastify_multipart_data_extraction";
import FileErrorException from "../errors/FileErrorException";

// Schema for viewing all documents with optional filters
const viewAllDocumentsQuery = DocumentsSchemas.idQuerys
  .pick({
    idClass: true,
    idStudent: true,
    idCourse: true,
    idTeacher: true,
    idRoom: true,
    idSubject:true
  })
  .partial();

export async function documentsRoutes(app: FastifyTypedInstance) {
  const controller = new DocumentsController();
  const extractData = new DataExtracMultipart();

  // Add a new document
  app.post(
    "/documents/add",
    {
      schema: {
        description: "Add a new document",
        tags: ["Documents"],
        consumes: ["multipart/form-data"],
        body: DocumentsSchemas.addDocument,
        headers: DocumentsSchemas.token,
        response: {
          200: DocumentsSchemas.successResponse,
          400: ResponsesSchemas.error_400_response,
          401: ResponsesSchemas.general_error_response,
          404: ResponsesSchemas.general_error_response,
          500: ResponsesSchemas.general_error_response,
        },
      },
    },
    async (request, reply) => {
      const file = await request.file();
      if(!file){
          throw new FileErrorException("File not provider")
      }
      const data = await extractData.extractFields(file);
      const validBody = DocumentsSchemas.addDocument.parse(data);
      const validToken = DocumentsSchemas.token.parse(request.headers);
      return reply.status(200).send(await controller.add(validBody, validToken, file));
    }
  );

  // Delete a document
  app.delete(
    "/documents",
    {
      schema: {
        description: "Delete a document",
        tags: ["Documents"],
        body: DocumentsSchemas.deleteDocument,
        headers: DocumentsSchemas.token,
        response: {
          200: DocumentsSchemas.successResponse,
          400: ResponsesSchemas.error_400_response,
          401: ResponsesSchemas.general_error_response,
          404: ResponsesSchemas.general_error_response,
          500: ResponsesSchemas.general_error_response,
        },
      },
    },
    async (request, reply) => {
      const validBody = DocumentsSchemas.deleteDocument.parse(request.body);
      const validToken = DocumentsSchemas.token.parse(request.headers);
      return reply.status(200).send(await controller.delete(validBody, validToken));
    }
  );

  // View a single document
  app.get(
    "/documents/:idDocument",
    {
      schema: {
        description: "View a single document",
        tags: ["Documents"],
        headers: DocumentsSchemas.token,
        params: DocumentsSchemas.viewDocumentById,
        response: {
          200: DocumentsSchemas.document,
          400: ResponsesSchemas.error_400_response,
          401: ResponsesSchemas.general_error_response,
          404: ResponsesSchemas.general_error_response,
          500: ResponsesSchemas.general_error_response,
        },
      },
    },
    async (request, reply) => {
      const validParams = DocumentsSchemas.viewDocumentById.parse(request.params);
      const validToken = DocumentsSchemas.token.parse(request.headers);
      return reply
        .status(200)
        .send(await controller.viewA({ idDocument: validParams.idDocument }, validToken, request));
    }
  );

  // View all documents
  app.get(
    "/documents",
    {
      schema: {
        description: "View all documents, optionally filtered by class, student, course, teacher, or room ID",
        tags: ["Documents"],
        headers: DocumentsSchemas.token,
        response: {
          200: DocumentsSchemas.documents,
          400: ResponsesSchemas.error_400_response,
          401: ResponsesSchemas.general_error_response,
          404: ResponsesSchemas.general_error_response,
          500: ResponsesSchemas.general_error_response,
        },
      },
    },
    async (request, reply) => {
      
      const validToken = DocumentsSchemas.token.parse(request.headers);
      return reply.status(200).send(await controller.viewAll(validToken, request));
    }
  );
}