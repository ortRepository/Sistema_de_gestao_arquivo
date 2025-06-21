import { z } from 'zod';
import { prisma } from '../config/PrismaClient';
import TokenService from '../services/TokensServices';
import InvalidDataException from '../errors/InvalidDataException';
import AuthorizationException from '../errors/AuthorizationException';
import ItemNotFoundException from '../errors/ItemNotFoundException';
import InternalServerErrorException from '../errors/InternalServerErrorException';
import RoomsSchema from '../schemas/RoomsSchemas';
import ResponsesSchemas from '../schemas/ResponsesSchemas';

class Rooms {
  private tokenService: TokenService = new TokenService();
  private readonly responseSchema = ResponsesSchemas.success_response;

  public async add(data: z.infer<typeof RoomsSchema.roomInput>, key: z.infer<typeof RoomsSchema.token>) {
    const { name, status, idCourse } = data;
    const { token } = key;

    try {
      const userRole = await this.tokenService.userRole(token);
      if (!await this.tokenService.checkTokenUser(token) || userRole !== 0) {
        throw new AuthorizationException('Not authorized');
      }

      const existingRoom = await prisma.rooms.findUnique({ where: { name } });
      if (existingRoom) {
        throw new ItemNotFoundException('Room already exists');
      }

      const newRoom = await prisma.rooms.create({
        data: {
          name,
          status,
          idCourse,
          createdIn: new Date(),
        },
      });

      return { message: 'Room added successfully' };
    } catch (error) {
      if (error instanceof AuthorizationException || error instanceof ItemNotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to add room');
    }
  }

  public async update(data: z.infer<typeof RoomsSchema.roomInput>, key: z.infer<typeof RoomsSchema.token>) {
    const { name, status, idCourse } = data;
    const { token } = key;

    try {
      const userRole = await this.tokenService.userRole(token);
      if (!await this.tokenService.checkTokenUser(token) || userRole !== 0) {
        throw new AuthorizationException('Not authorized');
      }

      const room = await prisma.rooms.findFirst();
      if (!room) {
        throw new ItemNotFoundException('Room not found');
      }

      await prisma.rooms.update({
        where: { idRoom: room.idRoom },
        data: {
          name,
          status,
          idCourse,
          updatedIn: new Date(),
        },
      });

      return { message: 'Room updated successfully' };
    } catch (error) {
      if (error instanceof AuthorizationException || error instanceof ItemNotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to update room');
    }
  }

  public async delete(data: z.infer<typeof RoomsSchema.idRoom>, key: z.infer<typeof RoomsSchema.token>) {
    const { idRoom } = data;
    const { token } = key;

    try {
      const userRole = await this.tokenService.userRole(token);
      if (!await this.tokenService.checkTokenUser(token) || userRole !== 0) {
        throw new AuthorizationException('Not authorized');
      }

      const room = await prisma.rooms.findUnique({ where: { idRoom } });
      if (!room) {
        throw new ItemNotFoundException('Room not found');
      }

      await prisma.rooms.delete({ where: { idRoom } });

      return { message: 'Room deleted successfully' };
    } catch (error) {
      if (error instanceof AuthorizationException || error instanceof ItemNotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to delete room');
    }
  }

  public async viewA(key: z.infer<typeof RoomsSchema.token>) {
    const { token } = key;

    try {
      if (!await this.tokenService.checkTokenUser(token)) {
        throw new AuthorizationException('Not authorized');
      }

      const userId = await this.tokenService.userId(token);
      if (!userId) {
        throw new AuthorizationException('Invalid user ID');
      }

      const room = await prisma.rooms.findFirst({ where: { idRoom: userId } });
      if (!room) {
        throw new ItemNotFoundException('Room not found');
      }

      return RoomsSchema.room.parse(room);
    } catch (error) {
      if (error instanceof AuthorizationException || error instanceof ItemNotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to retrieve room');
    }
  }

  public async viewAll(key: z.infer<typeof RoomsSchema.token>) {
    const { token } = key;

    try {
      const userRole = await this.tokenService.userRole(token);
      if (!await this.tokenService.checkTokenUser(token) || userRole !== 0) {
        throw new AuthorizationException('Not authorized');
      }

      const rooms = await prisma.rooms.findMany();
      return RoomsSchema.rooms.parse(rooms);
    } catch (error) {
      if (error instanceof AuthorizationException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to retrieve rooms');
    }
  }
}

export default Rooms;