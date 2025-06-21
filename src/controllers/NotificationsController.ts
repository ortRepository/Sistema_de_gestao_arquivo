import { z } from 'zod';
import { prisma } from '../config/PrismaClient';
import NotificationsSchemas from '../schemas/NotificationsSchemas';
import InvalidDataException from '../errors/InvalidDataException';
import ItemNotFoundException from '../errors/ItemNotFoundException';
import AuthorizationException from '../errors/AuthorizationException';
import InternalServerErrorException from '../errors/InternalServerErrorException';
import TokenService from '../services/TokensServices';

class NotificationsController {
  private tokenService: TokenService = new TokenService();
  private readonly responseSchema = NotificationsSchemas.successResponse;



  // Add a new notification
  public async add(title: string, description: string, idUser: number): Promise<void> {
    const data = { title, description, idUser };
    

    try {
      const user = await prisma.users.findUnique({ where: { idUser: idUser } });
      if (!user) {
        throw new ItemNotFoundException('User not found');
      }

      await prisma.notifications.create({
        data: {
          title: title,
          description: description,
          read: false,
          createdIn: new Date(),
          idUser: idUser,
        },
      });

      console.log(`Notification added for user ID ${idUser}`);
    } catch (error) {
      console.error('Error adding notification:', error);
      if (
        error instanceof ItemNotFoundException ||
        error instanceof InvalidDataException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to add notification');
    }
  }

  // Mark a notification as read
  public async read(data: z.infer<typeof NotificationsSchemas.markAsRead>, key: z.infer<typeof NotificationsSchemas.token>): Promise<z.infer<typeof this.responseSchema>> {
   
    const { idNotification } = data
    const { token } = key;

    try {
      const userId = await this.tokenService.userId(token);
      if (!userId) {
        throw new AuthorizationException('Not authorized');
      }

      const notification = await prisma.notifications.findUnique({
        where: { idNotification },
      });

      if (!notification) {
        throw new ItemNotFoundException('Notification not found');
      }

      if (notification.idUser !== userId) {
        throw new AuthorizationException('Not authorized to read this notification');
      }

      if (notification.read) {
        throw new InvalidDataException('Notification already marked as read');
      }

      await prisma.notifications.update({
        where: { idNotification },
        data: { read: true },
      });

      return { message: 'Notification marked as read successfully' };
    } catch (error) {
      console.error('[READ] Error occurred:', error);
      if (
        error instanceof ItemNotFoundException ||
        error instanceof AuthorizationException ||
        error instanceof InvalidDataException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to mark notification as read');
    }
  }

  // Delete a notification
  public async delete(data: z.infer<typeof NotificationsSchemas.deleteNotification>, key: z.infer<typeof NotificationsSchemas.token>): Promise<z.infer<typeof this.responseSchema>> {
 
    const { idNotification } = data;
    const { token } = key;

    try {
      const userId = await this.tokenService.userId(token);
      if (!userId) {
        throw new AuthorizationException('Not authorized');
      }

      const notification = await prisma.notifications.findUnique({
        where: { idNotification },
      });

      if (!notification) {
        throw new ItemNotFoundException('Notification not found');
      }

      if (notification.idUser !== userId) {
        throw new AuthorizationException('Not authorized to delete this notification');
      }

      await prisma.notifications.delete({
        where: { idNotification },
      });

      return { message: 'Notification deleted successfully' };
    } catch (error) {
      console.error('[DELETE] Error occurred:', error);
      if (
        error instanceof ItemNotFoundException ||
        error instanceof AuthorizationException ||
        error instanceof InvalidDataException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to delete notification');
    }
  }

  // View a single notification
  public async viewA(data: z.infer<typeof NotificationsSchemas.getNotification>, key: z.infer<typeof NotificationsSchemas.token>): Promise<z.infer<typeof NotificationsSchemas.notification>> {
   
    const { idNotification } = data;
    const { token } = key;

    try {
      const userId = await this.tokenService.userId(token);
      if (!userId) {
        throw new AuthorizationException('Not authorized');
      }

      const notification = await prisma.notifications.findUnique({
        where: { idNotification},
      });

      if (!notification) {
        throw new ItemNotFoundException('Notification not found');
      }

      if (notification.idUser !== userId) {
        throw new AuthorizationException('Not authorized to view this notification');
      }

      return NotificationsSchemas.notification.parse(notification);
    } catch (error) {
      console.error('[VIEW] Error occurred:', error);
      if (
        error instanceof ItemNotFoundException ||
        error instanceof AuthorizationException ||
        error instanceof InvalidDataException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to retrieve notification');
    }
  }

  // View all notifications for a user
  public async viewAll(key: z.infer<typeof NotificationsSchemas.token>): Promise<z.infer<typeof NotificationsSchemas.notificationsList>> {

    const { token } = key;

    try {
      const userId = await this.tokenService.userId(token);
      if (!userId) {
        throw new AuthorizationException('Not authorized');
      }

      const notifications = await prisma.notifications.findMany({
        where: { idUser: userId },
        orderBy: { createdIn: 'desc' },
      });

      return NotificationsSchemas.notificationsList.parse(notifications);
    } catch (error) {
      console.error('[VIEW_ALL] Error occurred:', error);
      if (
        error instanceof AuthorizationException ||
        error instanceof InvalidDataException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to retrieve notifications');
    }
  }
}

export default NotificationsController;