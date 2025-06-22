import { z } from 'zod';
import { prisma } from '../config/PrismaClient';
import DocumentsSchemas from '../schemas/DocumentsSchemas';
import InvalidDataException from '../errors/InvalidDataException';
import ItemNotFoundException from '../errors/ItemNotFoundException';
import AuthorizationException from '../errors/AuthorizationException';
import InternalServerErrorException from '../errors/InternalServerErrorException';
import TokenService from '../services/TokensServices';
import FileService from '../services/StorageServices';
import path from 'path';
import { FastifyRequest } from 'fastify';
import { MultipartFile } from '@fastify/multipart';

class DocumentsController {
  private tokenService: TokenService = new TokenService();
  private fileService: FileService = new FileService();
  private readonly responseSchema = DocumentsSchemas.successResponse;

  // Helper methods
  private async verifyAuthorization(token: string): Promise<number> {
    const userId = await this.tokenService.userId(token);
    if (!userId) {
      throw new AuthorizationException('Not authorized');
    }
    return userId;
  }

  private async getEntityInfo(
    entityType: 'class' | 'student' | 'course' | 'teacher' | 'room' | 'subject',
    id: number
  ): Promise<{ entityName: string; path: string }> {
    let entity;
    let entityName;

    switch (entityType) {
      case 'class':
        entity = await prisma.classes.findUnique({ where: { idClass: id } });
        entityName = 'classes';
        break;
      case 'student':
        entity = await prisma.students.findUnique({ where: { idStudent: id } });
        entityName = 'students';
        break;
      case 'course':
        entity = await prisma.courses.findUnique({ where: { idCourse: id } });
        entityName = 'courses';
        break;
      case 'teacher':
        entity = await prisma.teachers.findUnique({ where: { idTeacher: id } });
        entityName = 'teachers';
        break;
      case 'room':
        entity = await prisma.rooms.findUnique({ where: { idRoom: id } });
        entityName = 'rooms';
        break;
      case 'subject':
        entity = await prisma.subjects.findUnique({ where: { idSubject: id } });
        entityName = 'subjects';
        break;
    }

    if (!entity) {
      throw new ItemNotFoundException(`${entityType} not found`);
    }

    return { entityName, path: entity.path || '' };
  }

  private async processDocumentFile(
    file: MultipartFile,
    entityName: string,
    entityPath: string
  ): Promise<string> {
    if (!file) {
      throw new InvalidDataException('File not provided');
    }

    const fileBuffer = await file.toBuffer();
    const fileExtension = path.extname(file.filename);
    const fileName = `${Date.now()}${fileExtension}`;

    await this.fileService.saveFile(fileBuffer, fileName, `${entityName}/${entityPath}`);
    return fileName;
  }

  private getDocumentFilePath(document: any): string {
    let entityType: 'class' | 'student' | 'course' | 'teacher' | 'room' | 'subject' | null = null;
    let entityId: number | null = null;

    if (document.idClass) {
      entityType = 'class';
      entityId = document.idClass;
    } else if (document.idStudent) {
      entityType = 'student';
      entityId = document.idStudent;
    } else if (document.idCourse) {
      entityType = 'course';
      entityId = document.idCourse;
    } else if (document.idTeacher) {
      entityType = 'teacher';
      entityId = document.idTeacher;
    } else if (document.idRoom) {
      entityType = 'room';
      entityId = document.idRoom;
    } else if (document.idSubject) {
      entityType = 'subject';
      entityId = document.idSubject;
    }

    if (!entityType || !entityId) {
      return `documents/${document.path || ''}/${document.urlLink}`;
    }

    return `${entityType}s/${document.path || ''}/${document.urlLink}`;
  }

  private generateDocumentLink(document: any, req: FastifyRequest): string {
    const filePath = this.getDocumentFilePath(document);
    return this.fileService.generateLink(filePath, req, document.urlLink);
  }

  private async verifyDocumentOwnership(
    document: any,
    userId: number
  ): Promise<boolean> {
    if (document.idTeacher) {
      const teacher = await prisma.teachers.findUnique({
        where: { idTeacher: document.idTeacher },
      });
      return teacher?.idUser === userId;
    }
    return false;
  }

  // Main methods
  public async add(
    data: z.infer<typeof DocumentsSchemas.addDocument>,
    key: z.infer<typeof DocumentsSchemas.token>,
    file: MultipartFile
  ): Promise<z.infer<typeof this.responseSchema>> {
    const validatedData = DocumentsSchemas.addDocument.parse(data);
    const validatedKey = DocumentsSchemas.token.parse(key);
    const { description, path: documentPath, status, idClass, idStudent, idCourse, idTeacher, idRoom, idSubject } = validatedData;
    const { token } = validatedKey;

    try {
      await this.verifyAuthorization(token);

      // Verify at least one relation exists
      if (!idClass && !idStudent && !idCourse && !idTeacher && !idRoom && !idSubject) {
        throw new InvalidDataException('At least one relation (class, student, course, teacher, room, or subject) must be provided');
      }

      let entityInfo;
      if (idClass) entityInfo = await this.getEntityInfo('class', idClass);
      else if (idStudent) entityInfo = await this.getEntityInfo('student', idStudent);
      else if (idCourse) entityInfo = await this.getEntityInfo('course', idCourse);
      else if (idTeacher) entityInfo = await this.getEntityInfo('teacher', idTeacher);
      else if (idRoom) entityInfo = await this.getEntityInfo('room', idRoom);
      else if (idSubject) entityInfo = await this.getEntityInfo('subject', idSubject);

      const fileName = await this.processDocumentFile(
        file,
        entityInfo!.entityName,
        entityInfo!.path
      );

      await prisma.documents.create({
        data: {
          description,
          urlLink: fileName,
          path: documentPath,
          status,
          idClass,
          idStudent,
          idCourse,
          idTeacher,
          idRoom,
          idSubject,
          createdIn: new Date(),
        },
      });

      return { message: 'Document added successfully' };
    } catch (error) {
      console.error('[ADD] Error occurred:', error);
      if (error instanceof z.ZodError) {
        throw new InvalidDataException(error.errors.map(e => e.message).join(', '));
      }
      if (
        error instanceof AuthorizationException ||
        error instanceof InvalidDataException ||
        error instanceof ItemNotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to add document');
    }
  }

  public async delete(
    data: z.infer<typeof DocumentsSchemas.deleteDocument>,
    key: z.infer<typeof DocumentsSchemas.token>
  ): Promise<z.infer<typeof this.responseSchema>> {
    const validatedData = DocumentsSchemas.deleteDocument.parse(data);
    const validatedKey = DocumentsSchemas.token.parse(key);
    const { idDocument } = validatedData;
    const { token } = validatedKey;

    try {
      const userId = await this.verifyAuthorization(token);

      const document = await prisma.documents.findUnique({
        where: { idDocument },
      });

      if (!document) {
        throw new ItemNotFoundException('Document not found');
      }

      const isOwner = await this.verifyDocumentOwnership(document, userId);
      if (!isOwner) {
        throw new AuthorizationException('Not authorized to delete this document');
      }

      // Delete the physical file
      const filePath = this.getDocumentFilePath(document);
      await this.fileService.deleteFile(filePath);

      // Delete the database record
      await prisma.documents.delete({ where: { idDocument } });

      return { message: 'Document deleted successfully' };
    } catch (error) {
      console.error('[DELETE] Error occurred:', error);
      if (error instanceof z.ZodError) {
        throw new InvalidDataException(error.errors.map(e => e.message).join(', '));
      }
      if (
        error instanceof ItemNotFoundException ||
        error instanceof AuthorizationException ||
        error instanceof InvalidDataException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to delete document');
    }
  }

  public async viewA(
    data: z.infer<typeof DocumentsSchemas.viewDocumentById>,
    key: z.infer<typeof DocumentsSchemas.token>,
    req: FastifyRequest
  ): Promise<z.infer<typeof DocumentsSchemas.document>> {
    const validatedData = DocumentsSchemas.viewDocumentById.parse(data);
    const validatedKey = DocumentsSchemas.token.parse(key);
    const { idDocument } = validatedData;
    const { token } = validatedKey;

    try {
      const userId = await this.verifyAuthorization(token);

      const document = await prisma.documents.findUnique({
        where: { idDocument: Number(idDocument) },
      });

      if (!document) {
        throw new ItemNotFoundException('Document not found');
      }

      const isOwner = await this.verifyDocumentOwnership(document, userId);
      if (!isOwner) {
        throw new AuthorizationException('Not authorized to view this document');
      }

      if (document.urlLink) {
        document.urlLink = this.generateDocumentLink(document, req);
      }

      return DocumentsSchemas.document.parse(document);
    } catch (error) {
      console.error('[VIEW] Error occurred:', error);
      if (error instanceof z.ZodError) {
        throw new InvalidDataException(error.errors.map(e => e.message).join(', '));
      }
      if (
        error instanceof ItemNotFoundException ||
        error instanceof AuthorizationException ||
        error instanceof InvalidDataException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to retrieve document');
    }
  }

  private async viewByEntity(
    entityType: 'class' | 'student' | 'course' | 'teacher' | 'room' | 'subject',
    id: number,
    token: string,
    req: FastifyRequest
  ): Promise<z.infer<typeof DocumentsSchemas.documents>> {
    try {
      const userId = await this.verifyAuthorization(token);
      
      if (entityType === 'teacher') {
        const teacher = await prisma.teachers.findUnique({ where: { idTeacher: id } });
        if (!teacher || teacher.idUser !== userId) {
          throw new AuthorizationException(`Not authorized to view documents for this ${entityType}`);
        }
      } else {
        await this.getEntityInfo(entityType, id);
      }

      const documents = await prisma.documents.findMany({
        where: { [`id${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`]: id },
        orderBy: { createdIn: 'desc' },
      });

      for (const document of documents) {
        if (document.urlLink) {
          document.urlLink = this.generateDocumentLink(document, req);
        }
      }

      return DocumentsSchemas.documents.parse(documents);
    } catch (error) {
      console.error(`[VIEW_BY_${entityType.toUpperCase()}] Error occurred:`, error);
      if (error instanceof z.ZodError) {
        throw new InvalidDataException(error.errors.map(e => e.message).join(', '));
      }
      if (
        error instanceof AuthorizationException ||
        error instanceof InvalidDataException ||
        error instanceof ItemNotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(`An error occurred when trying to retrieve documents by ${entityType}`);
    }
  }

  public async viewByClasse(
    data: z.infer<typeof DocumentsSchemas.viewDocumentByClasse>,
    key: z.infer<typeof DocumentsSchemas.token>,
    req: FastifyRequest
  ): Promise<z.infer<typeof DocumentsSchemas.documents>> {
    const validatedData = DocumentsSchemas.viewDocumentByClasse.parse(data);
    const validatedKey = DocumentsSchemas.token.parse(key);
    const { idClasse } = validatedData;
    const { token } = validatedKey;

    return this.viewByEntity('class', Number(idClasse), token, req);
  }

  public async viewByStudent(
    data: z.infer<typeof DocumentsSchemas.viewDocumentByStudent>,
    key: z.infer<typeof DocumentsSchemas.token>,
    req: FastifyRequest
  ): Promise<z.infer<typeof DocumentsSchemas.documents>> {
    const validatedData = DocumentsSchemas.viewDocumentByStudent.parse(data);
    const validatedKey = DocumentsSchemas.token.parse(key);
    const { idStudent } = validatedData;
    const { token } = validatedKey;

    return this.viewByEntity('student', Number(idStudent), token, req);
  }

  public async viewByCourse(
    data: z.infer<typeof DocumentsSchemas.viewDocumentByCourse>,
    key: z.infer<typeof DocumentsSchemas.token>,
    req: FastifyRequest
  ): Promise<z.infer<typeof DocumentsSchemas.documents>> {
    const validatedData = DocumentsSchemas.viewDocumentByCourse.parse(data);
    const validatedKey = DocumentsSchemas.token.parse(key);
    const { idCourse } = validatedData;
    const { token } = validatedKey;

    return this.viewByEntity('course', Number(idCourse), token, req);
  }

  public async viewByTeacher(
    data: z.infer<typeof DocumentsSchemas.viewDocumentByTeacher>,
    key: z.infer<typeof DocumentsSchemas.token>,
    req: FastifyRequest
  ): Promise<z.infer<typeof DocumentsSchemas.documents>> {
    const validatedData = DocumentsSchemas.viewDocumentByTeacher.parse(data);
    const validatedKey = DocumentsSchemas.token.parse(key);
    const { idTeacher } = validatedData;
    const { token } = validatedKey;

    return this.viewByEntity('teacher', Number(idTeacher), token, req);
  }

  public async viewByRoom(
    data: z.infer<typeof DocumentsSchemas.viewDocumentByRoom>,
    key: z.infer<typeof DocumentsSchemas.token>,
    req: FastifyRequest
  ): Promise<z.infer<typeof DocumentsSchemas.documents>> {
    const validatedData = DocumentsSchemas.viewDocumentByRoom.parse(data);
    const validatedKey = DocumentsSchemas.token.parse(key);
    const { idRoom } = validatedData;
    const { token } = validatedKey;

    return this.viewByEntity('room', Number(idRoom), token, req);
  }

  public async viewBySubject(
    data: z.infer<typeof DocumentsSchemas.viewDocumentBySubject>,
    key: z.infer<typeof DocumentsSchemas.token>,
    req: FastifyRequest
  ): Promise<z.infer<typeof DocumentsSchemas.documents>> {
    const validatedData = DocumentsSchemas.viewDocumentBySubject.parse(data);
    const validatedKey = DocumentsSchemas.token.parse(key);
    const { idSubject } = validatedData;
    const { token } = validatedKey;

    return this.viewByEntity('subject', Number(idSubject), token, req);
  }

  public async viewAll(
    key: z.infer<typeof DocumentsSchemas.token>,
    req: FastifyRequest
  ): Promise<z.infer<typeof DocumentsSchemas.documents>> {
    const validatedKey = DocumentsSchemas.token.parse(key);
    const { token } = validatedKey;

    try {
      await this.verifyAuthorization(token);

      const documents = await prisma.documents.findMany({
        orderBy: { createdIn: 'desc' },
      });

      for (const document of documents) {
        if (document.urlLink) {
          document.urlLink = this.generateDocumentLink(document, req);
        }
      }

      return DocumentsSchemas.documents.parse(documents);
    } catch (error) {
      console.error('[VIEW_ALL] Error occurred:', error);
      if (error instanceof z.ZodError) {
        throw new InvalidDataException(error.errors.map(e => e.message).join(', '));
      }
      if (
        error instanceof AuthorizationException ||
        error instanceof InvalidDataException ||
        error instanceof ItemNotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to retrieve all documents');
    }
  }
}

export default DocumentsController;