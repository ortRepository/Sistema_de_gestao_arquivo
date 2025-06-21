import { z } from 'zod';
import { prisma } from '../config/PrismaClient';
import TokenService from '../services/TokensServices';
import InvalidDataException from '../errors/InvalidDataException';
import AuthorizationException from '../errors/AuthorizationException';
import ItemNotFoundException from '../errors/ItemNotFoundException';
import InternalServerErrorException from '../errors/InternalServerErrorException';
import StudentsSchema from '../schemas/StudentsSchemas';
import ResponsesSchemas from '../schemas/ResponsesSchemas';

class Students {
  private tokenService: TokenService = new TokenService();
  private readonly responseSchema = ResponsesSchemas.success_response;

  public async register(data: z.infer<typeof StudentsSchema.studentInput>, key: z.infer<typeof StudentsSchema.token>) {
    const { name, biNumber, room, classe: className, dateOfBirth, photo, status, idClasse } = data;
    const { token } = key;

    try {
      const userRole = await this.tokenService.userRole(token);
      if (!await this.tokenService.checkTokenUser(token) || userRole !== 0) {
        throw new AuthorizationException('Not authorized');
      }

      const existingStudent = await prisma.students.findFirst({ where: { biNumber } });
      if (existingStudent) {
        throw new ItemNotFoundException('Student already exists');
      }

      const newStudent = await prisma.students.create({
        data: {
          name,
          biNumber,
          room,
          classe: className,
          dateOfBirth,
          photo,
          status,
          idClasse,
          course:"",
          createdIn: new Date(),
        },
      });

      return { message: 'Student registered successfully' };
    } catch (error) {
      if (error instanceof AuthorizationException || error instanceof ItemNotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to register student');
    }
  }

  public async update(data: z.infer<typeof StudentsSchema.studentInput>, key: z.infer<typeof StudentsSchema.token>) {
    const { name, biNumber, room, classe: className, dateOfBirth, photo, status, idClasse } = data;
    const { token } = key;

    try {
      const userRole = await this.tokenService.userRole(token);
      if (!await this.tokenService.checkTokenUser(token) || userRole !== 0) {
        throw new AuthorizationException('Not authorized');
      }

      const student = await prisma.students.findFirst();
      if (!student) {
        throw new ItemNotFoundException('Student not found');
      }

      await prisma.students.update({
        where: { idStudent: student.idStudent },
        data: {
          name,
          biNumber,
          room,
          classe: className,
          dateOfBirth,
          photo,
          status,
          idClasse,
          updatedIn: new Date(),
        },
      });

      return { message: 'Student updated successfully' };
    } catch (error) {
      if (error instanceof AuthorizationException || error instanceof ItemNotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to update student');
    }
  }

  public async delete(data: z.infer<typeof StudentsSchema.idStudent>, key: z.infer<typeof StudentsSchema.token>) {
    const { idStudent } = data;
    const { token } = key;

    try {
      const userRole = await this.tokenService.userRole(token);
      if (!await this.tokenService.checkTokenUser(token) || userRole !== 0) {
        throw new AuthorizationException('Not authorized');
      }

      const student = await prisma.students.findUnique({ where: { idStudent } });
      if (!student) {
        throw new ItemNotFoundException('Student not found');
      }

      await prisma.students.delete({ where: { idStudent } });

      return { message: 'Student deleted successfully' };
    } catch (error) {
      if (error instanceof AuthorizationException || error instanceof ItemNotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to delete student');
    }
  }

  public async viewA(key: z.infer<typeof StudentsSchema.token>) {
    const { token } = key;

    try {
      if (!await this.tokenService.checkTokenUser(token)) {
        throw new AuthorizationException('Not authorized');
      }

      const userId = await this.tokenService.userId(token);
      if (!userId) {
        throw new AuthorizationException('Invalid user ID');
      }

      const student = await prisma.students.findFirst({ where: { idStudent: userId } });
      if (!student) {
        throw new ItemNotFoundException('Student not found');
      }

      return StudentsSchema.student.parse(student);
    } catch (error) {
      if (error instanceof AuthorizationException || error instanceof ItemNotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to retrieve student');
    }
  }

  public async viewAll(key: z.infer<typeof StudentsSchema.token>) {
    const { token } = key;

    try {
      const userRole = await this.tokenService.userRole(token);
      if (!await this.tokenService.checkTokenUser(token) || userRole !== 0) {
        throw new AuthorizationException('Not authorized');
      }

      const students = await prisma.students.findMany();
      return StudentsSchema.students.parse(students);
    } catch (error) {
      if (error instanceof AuthorizationException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to retrieve students');
    }
  }
}

export default Students;