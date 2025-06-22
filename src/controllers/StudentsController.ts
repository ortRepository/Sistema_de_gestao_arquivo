import { z } from 'zod';
import { prisma } from '../config/PrismaClient';
import TokenService from '../services/TokensServices';
import InvalidDataException from '../errors/InvalidDataException';
import AuthorizationException from '../errors/AuthorizationException';
import ItemNotFoundException from '../errors/ItemNotFoundException';
import InternalServerErrorException from '../errors/InternalServerErrorException';
import StudentsSchema from '../schemas/StudentsSchemas';
import ResponsesSchemas from '../schemas/ResponsesSchemas';
import * as fs from 'fs';
import path from 'path';

const uploadsPath = path.resolve(__dirname, '../../storage/students');

class StudentsController {
  private tokenService = new TokenService();
  private readonly responseSchema = ResponsesSchemas.success_response;

  public async register(
    data: z.infer<typeof StudentsSchema.studentInput>,
    key: z.infer<typeof StudentsSchema.token>
  ): Promise<z.infer<typeof this.responseSchema>> {
    const { name, biNumber, dateOfBirth, photo, status, idClass } = data;
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

      const classe = await prisma.classes.findUnique({ where: { idClass } });
      if (!classe) {
        throw new ItemNotFoundException('Class not found');
      }

      const room = await prisma.rooms.findUnique({ where: { idRoom: classe.idRoom as number } });
      if (!room) {
        throw new ItemNotFoundException('Room not found');
      }

      const course = await prisma.courses.findUnique({ where: { idCourse: room.idCourse as number } });
      if (!course) {
        throw new ItemNotFoundException('Course not found');
      }

      const newStudent = await prisma.students.create({
        data: {
          name,
          biNumber,
          room: room.name,
          class: classe.name,
          dateOfBirth,
          photo,
          status,
          idClass,
          course: course.name,
          createdIn: new Date(),
        },
      });

      const pathName = `${Date.now()}${newStudent.idStudent}`;
      const newFolderPath = path.join(uploadsPath, pathName);
      fs.mkdirSync(newFolderPath, { recursive: true });

      await prisma.students.update({
        where: { idStudent: newStudent.idStudent },
        data: { path: pathName },
      });

      return { message: 'Student registered successfully' };
    } catch (error) {
      console.error('[REGISTER] Error occurred:', error);
      if (error instanceof AuthorizationException || error instanceof ItemNotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to register student');
    }
  }

  public async update(
    data: z.infer<typeof StudentsSchema.studentInput> & { idStudent: number },
    key: z.infer<typeof StudentsSchema.token>
  ): Promise<z.infer<typeof this.responseSchema>> {
    const { idStudent, name, biNumber, dateOfBirth, photo, status, idClass } = data;
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

      const classe = await prisma.classes.findUnique({ where: { idClass } });
      if (!classe) {
        throw new ItemNotFoundException('Class not found');
      }

      const room = await prisma.rooms.findUnique({ where: { idRoom: classe.idRoom as number } });
      if (!room) {
        throw new ItemNotFoundException('Room not found');
      }

      const course = await prisma.courses.findUnique({ where: { idCourse: room.idCourse as number } });
      if (!course) {
        throw new ItemNotFoundException('Course not found');
      }

      await prisma.students.update({
        where: { idStudent },
        data: {
          name,
          biNumber,
          room: room.name,
          class: classe.name,
          dateOfBirth,
          photo,
          status,
          idClass,
          course: course.name,
          updatedIn: new Date(),
        },
      });

      return { message: 'Student updated successfully' };
    } catch (error) {
      console.error('[UPDATE] Error occurred:', error);
      if (error instanceof AuthorizationException || error instanceof ItemNotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to update student');
    }
  }

  public async delete(
    data: z.infer<typeof StudentsSchema.idStudent>,
    key: z.infer<typeof StudentsSchema.token>
  ): Promise<z.infer<typeof this.responseSchema>> {
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
      console.error('[DELETE] Error occurred:', error);
      if (error instanceof AuthorizationException || error instanceof ItemNotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to delete student');
    }
  }

  public async viewA(
    data: z.infer<typeof StudentsSchema.idStudent>,
    key: z.infer<typeof StudentsSchema.token>
  ): Promise<z.infer<typeof StudentsSchema.student>> {
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

      return StudentsSchema.student.parse(student);
    } catch (error) {
      console.error('[VIEW] Error occurred:', error);
      if (error instanceof AuthorizationException || error instanceof ItemNotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to retrieve student');
    }
  }

  public async viewAll(
    key: z.infer<typeof StudentsSchema.token>
  ): Promise<z.infer<typeof StudentsSchema.students>> {
    const { token } = key;

    try {
      const userRole = await this.tokenService.userRole(token);
      if (!await this.tokenService.checkTokenUser(token) || userRole !== 0) {
        throw new AuthorizationException('Not authorized');
      }

      const students = await prisma.students.findMany();
      return StudentsSchema.students.parse(students);
    } catch (error) {
      console.error('[VIEW_ALL] Error occurred:', error);
      if (error instanceof AuthorizationException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to retrieve students');
    }
  }
}

export default StudentsController;