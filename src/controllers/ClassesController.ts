import { z } from 'zod';
import { prisma } from '../config/PrismaClient';
import TokenService from '../services/TokensServices';
import InvalidDataException from '../errors/InvalidDataException';
import AuthorizationException from '../errors/AuthorizationException';
import ItemNotFoundException from '../errors/ItemNotFoundException';
import InternalServerErrorException from '../errors/InternalServerErrorException';
import ClassesSchema from '../schemas/ClassesSchemas';
import ResponsesSchemas from '../schemas/ResponsesSchemas';
import * as fs from 'fs';
import path from 'path';
const uploadsPath = path.resolve(__dirname, '../../storage/classes');
class Classes {
  private tokenService: TokenService = new TokenService();
  private readonly responseSchema = ResponsesSchemas.success_response;

  public async add(data: z.infer<typeof ClassesSchema.classInput>, key: z.infer<typeof ClassesSchema.token>) {
    const { name, status, idRoom } = data;
    const { token } = key;

    try {
      const userRole = await this.tokenService.userRole(token);
      if (!await this.tokenService.checkTokenUser(token) || userRole !== 0) {
        throw new AuthorizationException('Not authorized');
      }

      const existingClass = await prisma.classes.findUnique({ where: { name } });
      if (existingClass) {
        throw new ItemNotFoundException('Class already exists');
      }



      const newClass = await prisma.classes.create({
        data: {
          name,
          status,
          idRoom,
          createdIn: new Date(),
        },
      });

      const path_name = Date.now() + '' + newClass.idClass;
      const newFolderPath = path.join(uploadsPath, path_name);
      fs.mkdirSync(newFolderPath, { recursive: true });

      await prisma.classes.update({
        where:{
          idClass:newClass.idClass
        },
        data:{
          path:path_name
        }
      })

      return { message: 'Class added successfully' };
    } catch (error) {
      if (error instanceof AuthorizationException || error instanceof ItemNotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to add class');
    }
  }

  public async delete(data: z.infer<typeof ClassesSchema.idClass>, key: z.infer<typeof ClassesSchema.token>) {
    const { idClass } = data;
    const { token } = key;

    try {
      const userRole = await this.tokenService.userRole(token);
      if (!await this.tokenService.checkTokenUser(token) || userRole !== 0) {
        throw new AuthorizationException('Not authorized');
      }

      const classRecord = await prisma.classes.findUnique({ where: { idClass } });
      if (!classRecord) {
        throw new ItemNotFoundException('Class not found');
      }

      await prisma.classes.delete({ where: { idClass } });

      return { message: 'Class deleted successfully' };
    } catch (error) {
      if (error instanceof AuthorizationException || error instanceof ItemNotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to delete class');
    }
  }

  public async edit(data: z.infer<typeof ClassesSchema.classInput>, key: z.infer<typeof ClassesSchema.token>) {
    const { name, status, idRoom } = data;
    const { token } = key;

    try {
      const userRole = await this.tokenService.userRole(token);
      if (!await this.tokenService.checkTokenUser(token) || userRole !== 0) {
        throw new AuthorizationException('Not authorized');
      }

      const classRecord = await prisma.classes.findFirst();
      if (!classRecord) {
        throw new ItemNotFoundException('Class not found');
      }

      await prisma.classes.update({
        where: { idClass: classRecord.idClass },
        data: {
          name,
          status,
          idRoom,
          updatedIn: new Date(),
        },
      });

      return { message: 'Class updated successfully' };
    } catch (error) {
      if (error instanceof AuthorizationException || error instanceof ItemNotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to edit class');
    }
  }

  public async viewA(key: z.infer<typeof ClassesSchema.token>,data: z.infer<typeof ClassesSchema.idClass>) {
    const { token } = key;
    const {idClass} = data

    try {
      if (!await this.tokenService.checkTokenUser(token)) {
        throw new AuthorizationException('Not authorized');
      }

      const userId = await this.tokenService.userId(token);
      if (!userId) {
        throw new AuthorizationException('Invalid user ID');
      }

      const classRecord = await prisma.classes.findFirst({ where: { idClass} , include:{
        documents:true
      }});
      if (!classRecord) {
        throw new ItemNotFoundException('Class not found');
      }

      return ClassesSchema.class.parse(classRecord);
    } catch (error) {
      if (error instanceof AuthorizationException || error instanceof ItemNotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to retrieve class');
    }
  }

  public async viewAll(key: z.infer<typeof ClassesSchema.token>) {
    const { token } = key;

    try {
      const userRole = await this.tokenService.userRole(token);
      if (!await this.tokenService.checkTokenUser(token) || userRole !== 0) {
        throw new AuthorizationException('Not authorized');
      }

      const classes = await prisma.classes.findMany({
        include:{
          documents:true
        }
      });
      return ClassesSchema.classes.parse(classes);
    } catch (error) {
      if (error instanceof AuthorizationException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to retrieve classes');
    }
  }
}

export default Classes;