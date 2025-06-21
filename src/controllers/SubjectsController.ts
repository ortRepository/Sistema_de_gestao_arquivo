import { z } from 'zod';
import { prisma } from '../config/PrismaClient';
import TokenService from '../services/TokensServices';
import InvalidDataException from '../errors/InvalidDataException';
import AuthorizationException from '../errors/AuthorizationException';
import ItemNotFoundException from '../errors/ItemNotFoundException';
import InternalServerErrorException from '../errors/InternalServerErrorException';
import SubjectsSchema from '../schemas/SubjectsSchemas';
import ResponsesSchemas from '../schemas/ResponsesSchemas';

class Subjects {
  private tokenService: TokenService = new TokenService();
  private readonly responseSchema = ResponsesSchemas.success_response;

  public async register(data: z.infer<typeof SubjectsSchema.subjectInput>, key: z.infer<typeof SubjectsSchema.token>) {
    const { name, status,  idCourse } = data;
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

      const newSubject = await prisma.subjects.create({
        data: {
          name,
          status,
          path:"",
          idCourse,
          createdIn: new Date(),
        },
      });

      return { message: 'Subject registered successfully' };
    } catch (error) {
      if (error instanceof AuthorizationException || error instanceof ItemNotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to register subject');
    }
  }

  public async delete(data: z.infer<typeof SubjectsSchema.idSubject>, key: z.infer<typeof SubjectsSchema.token>) {
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
      if (error instanceof AuthorizationException || error instanceof ItemNotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to delete subject');
    }
  }

  public async update(data: z.infer<typeof SubjectsSchema.subjectInput>, key: z.infer<typeof SubjectsSchema.token>) {
    const { name, status,  idCourse } = data;
    const { token } = key;

    try {
      const userRole = await this.tokenService.userRole(token);
      if (!await this.tokenService.checkTokenUser(token) || userRole !== 0) {
        throw new AuthorizationException('Not authorized');
      }

      const subject = await prisma.subjects.findFirst();
      if (!subject) {
        throw new ItemNotFoundException('Subject not found');
      }

      await prisma.subjects.update({
        where: { idSubject: subject.idSubject },
        data: {
          name,
          status,
      
          idCourse,
          updatedIn: new Date(),
        },
      });

      return { message: 'Subject updated successfully' };
    } catch (error) {
      if (error instanceof AuthorizationException || error instanceof ItemNotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to update subject');
    }
  }

  public async viewA(key: z.infer<typeof SubjectsSchema.token>) {
    const { token } = key;

    try {
      if (!await this.tokenService.checkTokenUser(token)) {
        throw new AuthorizationException('Not authorized');
      }

      const userId = await this.tokenService.userId(token);
      if (!userId) {
        throw new AuthorizationException('Invalid user ID');
      }

      const subject = await prisma.subjects.findFirst({ where: { idSubject: userId } });
      if (!subject) {
        throw new ItemNotFoundException('Subject not found');
      }

      return SubjectsSchema.subject.parse(subject);
    } catch (error) {
      if (error instanceof AuthorizationException || error instanceof ItemNotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to retrieve subject');
    }
  }

  public async viewAll(key: z.infer<typeof SubjectsSchema.token>) {
    const { token } = key;

    try {
      const userRole = await this.tokenService.userRole(token);
      if (!await this.tokenService.checkTokenUser(token) || userRole !== 0) {
        throw new AuthorizationException('Not authorized');
      }

      const subjects = await prisma.subjects.findMany();
      return SubjectsSchema.subjects.parse(subjects);
    } catch (error) {
      if (error instanceof AuthorizationException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to retrieve subjects');
    }
  }
}

export default Subjects;