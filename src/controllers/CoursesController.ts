import { z } from 'zod';
import { prisma } from '../config/PrismaClient';
import TokenService from '../services/TokensServices';
import InvalidDataException from '../errors/InvalidDataException';
import AuthorizationException from '../errors/AuthorizationException';
import ItemNotFoundException from '../errors/ItemNotFoundException';
import InternalServerErrorException from '../errors/InternalServerErrorException';
import CoursesSchema from '../schemas/CoursesSchemas';
import ResponsesSchemas from '../schemas/ResponsesSchemas';

class Courses {
  private tokenService: TokenService = new TokenService();
  private readonly responseSchema = ResponsesSchemas.success_response;

  public async add(data: z.infer<typeof CoursesSchema.courseInput>, key: z.infer<typeof CoursesSchema.token>) {
    const { name, status } = data;
    const { token } = key;

    try {
      const userRole = await this.tokenService.userRole(token);
      if (!await this.tokenService.checkTokenUser(token) || userRole !== 0) {
        throw new AuthorizationException('Not authorized');
      }

      const existingCourse = await prisma.courses.findUnique({ where: { name } });
      if (existingCourse) {
        throw new ItemNotFoundException('Course already exists');
      }

      const newCourse = await prisma.courses.create({
        data: {
          name,
          status,
          createdIn: new Date(),
        },
      });

      return { message: 'Course added successfully' };
    } catch (error) {
      if (error instanceof AuthorizationException || error instanceof ItemNotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to add course');
    }
  }

  public async delete(data: z.infer<typeof CoursesSchema.idCourse>, key: z.infer<typeof CoursesSchema.token>) {
    const { idCourse } = data;
    const { token } = key;

    try {
      const userRole = await this.tokenService.userRole(token);
      if (!await this.tokenService.checkTokenUser(token) || userRole !== 0) {
        throw new AuthorizationException('Not authorized');
      }

      const course = await prisma.courses.findUnique({ where: { idCourse } });
      if (!course) {
        throw new ItemNotFoundException('Course not found');
      }

      await prisma.courses.delete({ where: { idCourse } });

      return { message: 'Course deleted successfully' };
    } catch (error) {
      if (error instanceof AuthorizationException || error instanceof ItemNotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to delete course');
    }
  }

  public async viewA(key: z.infer<typeof CoursesSchema.token>) {
    const { token } = key;

    try {
      if (!await this.tokenService.checkTokenUser(token)) {
        throw new AuthorizationException('Not authorized');
      }

      const userId = await this.tokenService.userId(token);
      if (!userId) {
        throw new AuthorizationException('Invalid user ID');
      }

      const course = await prisma.courses.findFirst({ where: { idCourse: userId } });
      if (!course) {
        throw new ItemNotFoundException('Course not found');
      }

      return CoursesSchema.course.parse(course);
    } catch (error) {
      if (error instanceof AuthorizationException || error instanceof ItemNotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to retrieve course');
    }
  }

  public async viewAll(key: z.infer<typeof CoursesSchema.token>) {
    const { token } = key;

    try {
      const userRole = await this.tokenService.userRole(token);
      if (!await this.tokenService.checkTokenUser(token) || userRole !== 0) {
        throw new AuthorizationException('Not authorized');
      }

      const courses = await prisma.courses.findMany();
      return CoursesSchema.courses.parse(courses);
    } catch (error) {
      if (error instanceof AuthorizationException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to retrieve courses');
    }
  }

  public async edit(data: z.infer<typeof CoursesSchema.courseInput>, key: z.infer<typeof CoursesSchema.token>) {
    const { name, status } = data;
    const { token } = key;

    try {
      const userRole = await this.tokenService.userRole(token);
      if (!await this.tokenService.checkTokenUser(token) || userRole !== 0) {
        throw new AuthorizationException('Not authorized');
      }

      const course = await prisma.courses.findFirst();
      if (!course) {
        throw new ItemNotFoundException('Course not found');
      }

      await prisma.courses.update({
        where: { idCourse: course.idCourse },
        data: {
          name,
          status,
          updatedIn: new Date(),
        },
      });

      return { message: 'Course updated successfully' };
    } catch (error) {
      if (error instanceof AuthorizationException || error instanceof ItemNotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to edit course');
    }
  }
}

export default Courses;