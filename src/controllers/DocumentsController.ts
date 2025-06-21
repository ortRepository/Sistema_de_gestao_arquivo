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

  public async add(
    data: z.infer<typeof DocumentsSchemas.addDocument>,
    key: z.infer<typeof DocumentsSchemas.token>,
    file: MultipartFile
  ): Promise<z.infer<typeof this.responseSchema>> {
    const validatedData = DocumentsSchemas.addDocument.parse(data);
    const validatedKey = DocumentsSchemas.token.parse(key);
    const { description, urlLink, path: documentPath, status, idClasse, idStudent, idCourse, idTeacher, idRoom } = validatedData;
    const { token } = validatedKey;

    try {
      const userId = await this.tokenService.userId(token);
      if (!userId) {
        throw new AuthorizationException('Not authorized');
      }

      // Verifica se pelo menos um critério de relação está presente
      if (!idClasse && !idStudent && !idCourse && !idTeacher && !idRoom) {
        throw new InvalidDataException('At least one relation (class, student, course, teacher, or room) must be provided');
      }

      // Verifica existência das entidades relacionadas
      let authorized = false;
      if (idClasse) {
        const classe = await prisma.classes.findUnique({ where: { idClasse } });
        if (!classe) throw new ItemNotFoundException('Class not found');
      }
         
      if (idStudent) {
        const student = await prisma.students.findUnique({ where: { idStudent } });
        if (!student) throw new ItemNotFoundException('Student not found');
      }
      
      if (idCourse) {
        const course = await prisma.courses.findUnique({ where: { idCourse } });
        if (!course) throw new ItemNotFoundException('Course not found');
      }
      
      if (idTeacher) {
        const teacher = await prisma.teachers.findUnique({ where: { idTeacher } });
        if (!teacher) throw new ItemNotFoundException('Teacher not found');
        if (teacher.idUser === userId) authorized = true;
      }
      
      if (idRoom) {
        const room = await prisma.rooms.findUnique({ where: { idRoom } });
        if (!room) throw new ItemNotFoundException('Room not found');
      }

      if (!authorized) {
        throw new AuthorizationException('Not authorized to add documents');
      }

      if (!file) {
        throw new InvalidDataException('File not provided');
      }

      const fileBuffer = await file.toBuffer();
      const fileExtension = path.extname(file.filename);
      const fileName = `${Date.now()}${fileExtension}`;
      const pathName = `${Date.now()}_${idClasse || idStudent || idCourse || idTeacher || idRoom || userId}`;

      await this.fileService.saveFile(fileBuffer, fileName, `documents/${pathName}/`);

      const document = await prisma.documents.create({
        data: {
          description,
          urlLink: fileName,
          path: documentPath,
          status,
          idClasse,
          idStudent,
          idCourse,
          idTeacher,
          idRoom,
          createdIn: new Date(),
        },
      });

      console.log('[ADD] Document created:', document);

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
      const userId = await this.tokenService.userId(token);
      if (!userId) {
        throw new AuthorizationException('Not authorized');
      }

      const document = await prisma.documents.findUnique({
        where: { idDocument },
      });

      if (!document) {
        throw new ItemNotFoundException('Document not found');
      }

      let authorized = false;
      if (document.idClasse) {
        const classe = await prisma.classes.findUnique({ where: { idClasse: document.idClasse } });
         
      }
      if (document.idStudent) {
        const student = await prisma.students.findUnique({ where: { idStudent: document.idStudent } });
         
      }
      if (document.idCourse) {
        const course = await prisma.courses.findUnique({ where: { idCourse: document.idCourse } });
         
      }
      if (document.idTeacher) {
        const teacher = await prisma.teachers.findUnique({ where: { idTeacher: document.idTeacher } });
        if (teacher?.idUser === userId) authorized = true;
      }
      if (document.idRoom) {
        const room = await prisma.rooms.findUnique({ where: { idRoom: document.idRoom } });
        
      }
      if (!authorized) {
        throw new AuthorizationException('Not authorized to delete this document');
      }

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
      const userId = await this.tokenService.userId(token);
      if (!userId) {
        throw new AuthorizationException('Not authorized');
      }

      const document = await prisma.documents.findUnique({
        where: { idDocument: Number(idDocument) },
      });

      if (!document) {
        throw new ItemNotFoundException('Document not found');
      }

      let authorized = false;
      if (document.idClasse) {
        const classe = await prisma.classes.findUnique({ where: { idClasse: document.idClasse } });
        
      }
      if (document.idStudent) {
        const student = await prisma.students.findUnique({ where: { idStudent: document.idStudent } });
        
      }
      if (document.idCourse) {
        const course = await prisma.courses.findUnique({ where: { idCourse: document.idCourse } });
        
      }
      if (document.idTeacher) {
        const teacher = await prisma.teachers.findUnique({ where: { idTeacher: document.idTeacher } });
        if (teacher?.idUser === userId) authorized = true;
      }
      if (document.idRoom) {
        const room = await prisma.rooms.findUnique({ where: { idRoom: document.idRoom } });
      
      }
      if (!authorized) {
        throw new AuthorizationException('Not authorized to view this document');
      }

      if (document.urlLink) {
        document.urlLink = this.fileService.generateLink(`documents/${document.path || ''}/${document.urlLink}`, req, document.urlLink);
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

  

  public async viewByClasse(
    data: z.infer<typeof DocumentsSchemas.viewDocumentByClasse>,
    key: z.infer<typeof DocumentsSchemas.token>,
    req: FastifyRequest
  ): Promise<z.infer<typeof DocumentsSchemas.documents>> {
    const validatedData = DocumentsSchemas.viewDocumentByClasse.parse(data);
    const validatedKey = DocumentsSchemas.token.parse(key);
    const { idClasse } = validatedData;
    const { token } = validatedKey;

    try {
      const userId = await this.tokenService.userId(token);
      if (!userId) {
        throw new AuthorizationException('Not authorized');
      }

      const classe = await prisma.classes.findUnique({ where: { idClasse: Number(idClasse) } });
      if (!classe  ) {
        throw new AuthorizationException('Not authorized to view documents for this class');
      }

      const documents = await prisma.documents.findMany({
        where: { idClasse: Number(idClasse) },
        orderBy: { createdIn: 'desc' },
      });

      for (const document of documents) {
        if (document.urlLink) {
          document.urlLink = this.fileService.generateLink(`documents/${document.path || ''}/${document.urlLink}`, req, document.urlLink);
        }
      }

      return DocumentsSchemas.documents.parse(documents);
    } catch (error) {
      console.error('[VIEW_BY_CLASSE] Error occurred:', error);
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
      throw new InternalServerErrorException('An error occurred when trying to retrieve documents by class');
    }
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

    try {
      const userId = await this.tokenService.userId(token);
      if (!userId) {
        throw new AuthorizationException('Not authorized');
      }

      const student = await prisma.students.findUnique({ where: { idStudent: Number(idStudent) } });
      if (!student  ) {
        throw new AuthorizationException('Not authorized to view documents for this student');
      }

      const documents = await prisma.documents.findMany({
        where: { idStudent: Number(idStudent) },
        orderBy: { createdIn: 'desc' },
      });

      for (const document of documents) {
        if (document.urlLink) {
          document.urlLink = this.fileService.generateLink(`documents/${document.path || ''}/${document.urlLink}`, req, document.urlLink);
        }
      }

      return DocumentsSchemas.documents.parse(documents);
    } catch (error) {
      console.error('[VIEW_BY_STUDENT] Error occurred:', error);
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
      throw new InternalServerErrorException('An error occurred when trying to retrieve documents by student');
    }
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

    try {
      const userId = await this.tokenService.userId(token);
      if (!userId) {
        throw new AuthorizationException('Not authorized');
      }

      const course = await prisma.courses.findUnique({ where: { idCourse: Number(idCourse) } });
      if (!course  ) {
        throw new AuthorizationException('Not authorized to view documents for this course');
      }

      const documents = await prisma.documents.findMany({
        where: { idCourse: Number(idCourse) },
        orderBy: { createdIn: 'desc' },
      });

      for (const document of documents) {
        if (document.urlLink) {
          document.urlLink = this.fileService.generateLink(`documents/${document.path || ''}/${document.urlLink}`, req, document.urlLink);
        }
      }

      return DocumentsSchemas.documents.parse(documents);
    } catch (error) {
      console.error('[VIEW_BY_COURSE] Error occurred:', error);
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
      throw new InternalServerErrorException('An error occurred when trying to retrieve documents by course');
    }
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

    try {
      const userId = await this.tokenService.userId(token);
      if (!userId) {
        throw new AuthorizationException('Not authorized');
      }

      const teacher = await prisma.teachers.findUnique({ where: { idTeacher: Number(idTeacher) } });
      if (!teacher || teacher.idUser !== userId) {
        throw new AuthorizationException('Not authorized to view documents for this teacher');
      }

      const documents = await prisma.documents.findMany({
        where: { idTeacher: Number(idTeacher) },
        orderBy: { createdIn: 'desc' },
      });

      for (const document of documents) {
        if (document.urlLink) {
          document.urlLink = this.fileService.generateLink(`documents/${document.path || ''}/${document.urlLink}`, req, document.urlLink);
        }
      }

      return DocumentsSchemas.documents.parse(documents);
    } catch (error) {
      console.error('[VIEW_BY_TEACHER] Error occurred:', error);
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
      throw new InternalServerErrorException('An error occurred when trying to retrieve documents by teacher');
    }
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

    try {
      const userId = await this.tokenService.userId(token);
      if (!userId) {
        throw new AuthorizationException('Not authorized');
      }

      const room = await prisma.rooms.findUnique({ where: { idRoom: Number(idRoom) } });
      

      const documents = await prisma.documents.findMany({
        where: { idRoom: Number(idRoom) },
        orderBy: { createdIn: 'desc' },
      });

      for (const document of documents) {
        if (document.urlLink) {
          document.urlLink = this.fileService.generateLink(`documents/${document.path || ''}/${document.urlLink}`, req, document.urlLink);
        }
      }

      return DocumentsSchemas.documents.parse(documents);
    } catch (error) {
      console.error('[VIEW_BY_ROOM] Error occurred:', error);
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
      throw new InternalServerErrorException('An error occurred when trying to retrieve documents by room');
    }
  }

  
  public async viewAll(
    
    key: z.infer<typeof DocumentsSchemas.token>,
    req: FastifyRequest
  ): Promise<z.infer<typeof DocumentsSchemas.documents>> {
   
    const validatedKey = DocumentsSchemas.token.parse(key);
 
    const { token } = validatedKey;

    try {
      const userId = await this.tokenService.userId(token);
      if (!userId) {
        throw new AuthorizationException('Not authorized');
      }


      const documents = await prisma.documents.findMany({
      
        orderBy: { createdIn: 'desc' },
      });

      for (const document of documents) {
        if (document.urlLink) {
          document.urlLink = this.fileService.generateLink(`documents/${document.path || ''}/${document.urlLink}`, req, document.urlLink);
        }
      }

      return DocumentsSchemas.documents.parse(documents);
    } catch (error) {
      console.error('[VIEW_BY_ROOM] Error occurred:', error);
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
      throw new InternalServerErrorException('An error occurred when trying to retrieve documents by room');
    }
  }

  

}

export default DocumentsController;