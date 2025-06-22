import { z } from 'zod';
import { prisma } from '../config/PrismaClient';
import TokenService from '../services/TokensServices';
import InvalidDataException from '../errors/InvalidDataException';
import AuthorizationException from '../errors/AuthorizationException';
import ItemNotFoundException from '../errors/ItemNotFoundException';
import InternalServerErrorException from '../errors/InternalServerErrorException';
import SubjectsSchema from '../schemas/SubjectsSchemas';
import ResponsesSchemas from '../schemas/ResponsesSchemas';
import * as fs from 'fs';
import path from 'path';

const uploadsPath = path.resolve(__dirname, '../../storage/subjects');

class SubjectsController {
  private tokenService = new TokenService();
  private readonly responseSchema = ResponsesSchemas.success_response;

  public async register(
    data: z.infer<typeof SubjectsSchema.subjectInput>,
    key: z.infer<typeof SubjectsSchema.token>
  ): Promise<z.infer<typeof this.responseSchema>> {
    const { name, status, idCourse } = data;
    const { token } = key;

    try {
      const userRole = await this.tokenService.userRole(token);
      if (!await this.tokenService.checkTokenUser(token) || userRole !== 0) {
        throw new AuthorizationException('Not authorized');
      }

      const existingSubject = await prisma.subjects.findUnique({ where: { name } });
      if (existingSubject) {
        throw new ItemNotFoundException('Subject already exists');
      }

      const course = await prisma.courses.findUnique({ where: { idCourse } });
      if (!course) {
        throw new ItemNotFoundException('Course not found');
      }

      const newSubject = await prisma.subjects.create({
        data: {
          name,
          status,
          path: '',
          idCourse,
          createdIn: new Date(),
        },
      });

      const pathName = `${Date.now()}${newSubject.idSubject}`;
      const newFolderPath = path.join(uploadsPath, pathName);
      fs.mkdirSync(newFolderPath, { recursive: true });

      await prisma.subjects.update({
        where: { idSubject: newSubject.idSubject },
        data: { path: pathName },
      });

      return { message: 'Subject registered successfully' };
    } catch (error) {
      console.error('[REGISTER] Error occurred:', error);
      if (error instanceof AuthorizationException || error instanceof ItemNotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to register subject');
    }
  }

  public async update(
    data: z.infer<typeof SubjectsSchema.subjectInput> & { idSubject: number },
    key: z.infer<typeof SubjectsSchema.token>
  ): Promise<z.infer<typeof this.responseSchema>> {
    const { idSubject, name, status, idCourse } = data;
    const { token } = key;

    try {
      const userRole = await this.tokenService.userRole(token);
      if (!await this.tokenService.checkTokenUser(token) || userRole !== 0) {
        throw new AuthorizationException('Not authorized');
      }

      const subject = await prisma.subjects.findUnique({ where: { idSubject } });
      if (!subject) {
        throw new ItemNotFoundException('Subject not found');
      }

      const course = await prisma.courses.findUnique({ where: { idCourse } });
      if (!course) {
        throw new ItemNotFoundException('Course not found');
      }

      await prisma.subjects.update({
        where: { idSubject },
        data: {
          name,
          status,
          idCourse,
          updatedIn: new Date(),
        },
      });

      return { message: 'Subject updated successfully' };
    } catch (error) {
      console.error('[UPDATE] Error occurred:', error);
      if (error instanceof AuthorizationException || error instanceof ItemNotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to update subject');
    }
  }

  public async delete(
    data: z.infer<typeof SubjectsSchema.idSubject>,
    key: z.infer<typeof SubjectsSchema.token>
  ): Promise<z.infer<typeof this.responseSchema>> {
    const { idSubject } = data;
    const { token } = key;

    try {
      const userRole = await this.tokenService.userRole(token);
      if (!await this.tokenService.checkTokenUser(token) || userRole !== 0) {
        throw new AuthorizationException('Not authorized');
      }

      const subject = await prisma.subjects.findUnique({ where: { idSubject } });
      if (!subject) {
        throw new ItemNotFoundException('Subject not found');
      }

      await prisma.subjects.delete({ where: { idSubject } });

      return { message: 'Subject deleted successfully' };
    } catch (error) {
      console.error('[DELETE] Error occurred:', error);
      if (error instanceof AuthorizationException || error instanceof ItemNotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to delete subject');
    }
  }

  public async viewA(
    data: z.infer<typeof SubjectsSchema.idSubject>,
    key: z.infer<typeof SubjectsSchema.token>
  ): Promise<z.infer<typeof SubjectsSchema.subject>> {
    const { idSubject } = data;
    const { token } = key;

    try {
      const userRole = await this.tokenService.userRole(token);
      if (!await this.tokenService.checkTokenUser(token) || userRole !== 0) {
        throw new AuthorizationException('Not authorized');
      }

      const subject = await prisma.subjects.findUnique({ where: { idSubject } });
      if (!subject) {
        throw new ItemNotFoundException('Subject not found');
      }

      return SubjectsSchema.subject.parse(subject);
    } catch (error) {
      console.error('[VIEW] Error occurred:', error);
      if (error instanceof AuthorizationException || error instanceof ItemNotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to retrieve subject');
    }
  }

  public async viewAll(
    key: z.infer<typeof SubjectsSchema.token>
  ): Promise<z.infer<typeof SubjectsSchema.subjects>> {
    const { token } = key;

    try {
      const userRole = await this.tokenService.userRole(token);
      if (!await this.tokenService.checkTokenUser(token) || userRole !== 0) {
        throw new AuthorizationException('Not authorized');
      }

      const subjects = await prisma.subjects.findMany();
      return SubjectsSchema.subjects.parse(subjects);
    } catch (error) {
      console.error('[VIEW_ALL] Error occurred:', error);
      if (error instanceof AuthorizationException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to retrieve subjects');
    }
  }
}

export default SubjectsController;