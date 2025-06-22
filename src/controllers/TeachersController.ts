import { z } from 'zod';
import { prisma } from '../config/PrismaClient';
import TeachersSchemas from '../schemas/TeachersSchemas';
import InvalidDataException from '../errors/InvalidDataException';
import ItemNotFoundException from '../errors/ItemNotFoundException';
import AuthorizationException from '../errors/AuthorizationException';
import InternalServerErrorException from '../errors/InternalServerErrorException';
import TokenService from '../services/TokensServices';
import EmailService from '../services/EmailsServices';
import path from 'path';
import bcrypt from 'bcryptjs';
import * as fs from 'fs';

const uploadsPath = path.resolve(__dirname, '../../storage/teachers');
const saltRounds = 10;

class TeachersController {
  private tokenService = new TokenService();
  private emailService = new EmailService();
  private readonly responseSchema = TeachersSchemas.successResponse;

  // Generate a random 8-digit password
  private generateRandomPassword(): string {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  }

  public async add(
    data: z.infer<typeof TeachersSchemas.addTeacher>,
    key: z.infer<typeof TeachersSchemas.token>
  ): Promise<z.infer<typeof this.responseSchema>> {
    const { name, email, telephone, role, function: teacherFunction, photo, status } = data;
    const { token } = key;

    try {
      const userId = await this.tokenService.userId(token);
      if (!userId) {
        throw new AuthorizationException('Not authorized');
      }

      // Check if email already exists in Users
      const existingUser = await prisma.users.findFirst({ where: { email } });
      if (existingUser) {
        throw new InvalidDataException('Email already registered');
      }

      // Generate random password
      const password = this.generateRandomPassword();
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user in Users table
      const newUser = await prisma.users.create({
        data: {
          name,
          email,
          phoneNumber: telephone || '',
          password: hashedPassword,
          role,
          status: true,
          token: '',
          createdIn: new Date(),
        },
      });

      // Create folder for teacher
      const pathName = `${Date.now()}${newUser.idUser}`;
      const newFolderPath = path.join(uploadsPath, pathName);
      fs.mkdirSync(newFolderPath, { recursive: true });

      // Update user with path
      await prisma.users.update({
        where: { idUser: newUser.idUser },
        data: { path: pathName },
      });

      // Create teacher in Teachers table
      const teacher = await prisma.teachers.create({
        data: {
          function: teacherFunction,
          photo,
          path: pathName, // Use the same path as user
          name,
          email: newUser.email,
          status,
          createdIn: new Date(),
          user: { connect: { idUser: newUser.idUser } },
        },
      });

      // Send email with credentials
      if (!(await this.emailService.send_message_code(email, password))) {
        await prisma.teachers.delete({ where: { idTeacher: teacher.idTeacher } });
        await prisma.users.delete({ where: { idUser: newUser.idUser } });
        throw new InvalidDataException('An error occurred while sending email');
      }

      console.log('[ADD] Teacher created:', teacher);

      return { message: 'Teacher added successfully' };
    } catch (error) {
      console.error('[ADD] Error occurred:', error);
      if (
        error instanceof AuthorizationException ||
        error instanceof InvalidDataException ||
        error instanceof ItemNotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to add teacher');
    }
  }

  public async delete(
    data: z.infer<typeof TeachersSchemas.deleteTeacher>,
    key: z.infer<typeof TeachersSchemas.token>
  ): Promise<z.infer<typeof this.responseSchema>> {
    const { idTeacher } = data;
    const { token } = key;

    try {
      const userId = await this.tokenService.userId(token);
      if (!userId) {
        throw new AuthorizationException('Not authorized');
      }

      const teacher = await prisma.teachers.findUnique({ where: { idTeacher } });
      if (!teacher) {
        throw new ItemNotFoundException('Teacher not found');
      }

      // Delete the teacher (user remains in Users table)
      await prisma.teachers.delete({ where: { idTeacher } });

      return { message: 'Teacher deleted successfully' };
    } catch (error) {
      console.error('[DELETE] Error occurred:', error);
      if (
        error instanceof ItemNotFoundException ||
        error instanceof AuthorizationException ||
        error instanceof InvalidDataException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to delete teacher');
    }
  }

  public async viewA(
    data: z.infer<typeof TeachersSchemas.viewTeacher>,
    key: z.infer<typeof TeachersSchemas.token>
  ): Promise<z.infer<typeof TeachersSchemas.teacher>> {
    const { idTeacher } = data;
    const { token } = key;

    try {
      const userId = await this.tokenService.userId(token);
      if (!userId) {
        throw new AuthorizationException('Not authorized');
      }

      const teacher = await prisma.teachers.findUnique({ where: { idTeacher: Number(idTeacher) } });
      if (!teacher) {
        throw new ItemNotFoundException('Teacher not found');
      }

      return TeachersSchemas.teacher.parse(teacher);
    } catch (error) {
      console.error('[VIEW] Error occurred:', error);
      if (
        error instanceof ItemNotFoundException ||
        error instanceof AuthorizationException ||
        error instanceof InvalidDataException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to retrieve teacher');
    }
  }

  public async viewAll(
   
    key: z.infer<typeof TeachersSchemas.token>
  ): Promise<z.infer<typeof TeachersSchemas.teachers>> {

    const { token } = key;

    try {
      const userId = await this.tokenService.userId(token);
      if (!userId) {
        throw new AuthorizationException('Not authorized');
      }

      const whereClause: any = {};
     

      const teachers = await prisma.teachers.findMany({
        where: whereClause,
        orderBy: { createdIn: 'desc' },
      });

      return TeachersSchemas.teachers.parse(teachers);
    } catch (error) {
      console.error('[VIEW_ALL] Error occurred:', error);
      if (
        error instanceof AuthorizationException ||
        error instanceof InvalidDataException ||
        error instanceof ItemNotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to retrieve teachers');
    }
  }
}

export default TeachersController;