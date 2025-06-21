import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/PrismaClient';
import EmailService from '../services/EmailsServices';
import GenerateVerificationCode from '../utils/code_generations';
import TokenService from '../services/TokensServices';
import NotificationsController from './NotificationsController';
import UserSchema from '../schemas/UsersSchemas';
import path, { resolve } from 'path';
import * as fs from 'fs';
import { config } from 'dotenv';
import { FastifyRequest } from 'fastify';
import FileService from '../services/StorageServices';
import InvalidDataException from '../errors/InvalidDataException';
import AuthorizationException from '../errors/AuthorizationException';
import ItemNotFoundException from '../errors/ItemNotFoundException';
import ItemAlreadyExistsException from '../errors/ItemAlreadyExistsException';
import ForbiddenExceptionError from '../errors/ForbiddenExceptionError';
import InternalServerErrorException from '../errors/InternalServerErrorException';
import ResponsesSchemas from '../schemas/ResponsesSchemas';

const saltRounds = 10;
const uploadsPath = path.resolve(__dirname, '../../storage/users');
// Configure environment
const envPath = resolve(__dirname, '../.env');
config({ path: envPath });
const secretKey = { secretKey: process.env.SECRET_KEY || 'default' };

class Users {
  private emailService: EmailService;
  private tokenService: TokenService = new TokenService();
  private notification: NotificationsController = new NotificationsController();
  private fileService: FileService = new FileService();

  private readonly responseSchema = ResponsesSchemas.success_response;

  constructor() {
    this.emailService = new EmailService();
    if (secretKey.secretKey === 'default') {
      throw new InternalServerErrorException('Secret key is not defined in the environment variables');
    }
  }



  public async updatePasswordWithCode(data: z.infer<typeof UserSchema.recoveryPassword>): Promise<z.infer<typeof this.responseSchema>> {
    const { email, code, newPassword } = data;

    try {
      const user = await prisma.users.findUnique({
        where: { email },
      });

      if (!user) {
        throw new ItemNotFoundException('User not found');
      }

      if (user.role === 0) {
        throw new ForbiddenExceptionError('An administrator cannot recover the password');
      }

      const verificationCode = await prisma.verificationsCodes.findFirst({
        where: {
          email,
          code,
          used: false,
        },
      });

      if (!verificationCode) {
        throw new ItemNotFoundException('Invalid or already used verification code');
      }

      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      await prisma.users.update({
        where: { idUser: user.idUser },
        data: { password: hashedPassword },
      });

      await prisma.verificationsCodes.update({
        where: { idVerificationCode: verificationCode.idVerificationCode },
        data: { used: true },
      });

      return { message: 'Password updated successfully' };
    } catch (error) {
      if (
        error instanceof ItemNotFoundException ||
        error instanceof ForbiddenExceptionError ||
        error instanceof InvalidDataException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to change password');
    }
  }

  public async changeEmail(data: z.infer<typeof UserSchema.changeEmail>, key: z.infer<typeof UserSchema.token>): Promise<z.infer<typeof this.responseSchema>> {
    const { newEmail, code, password } = data;
    const { token } = key;

    try {
      const userId = await this.tokenService.userId(token);
      if (!userId) {
        throw new AuthorizationException('Not authorized');
      }

      const user = await prisma.users.findUnique({
        where: { idUser: userId },
      });

      if (!user) {
        throw new ItemNotFoundException('User not found');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new AuthorizationException('Incorrect password');
      }

      const verificationCode = await prisma.verificationsCodes.findFirst({
        where: { email: newEmail, code, used: false },
      });

      if (!verificationCode) {
        throw new ItemNotFoundException('Invalid or already used verification code');
      }

      const emailInUse = await prisma.users.findUnique({
        where: { email: newEmail },
      });

      if (emailInUse) {
        throw new ItemAlreadyExistsException('Email in use');
      }

      await prisma.users.update({
        where: { idUser: userId },
        data: { email: newEmail },
      });

      await prisma.verificationsCodes.update({
        where: { idVerificationCode: verificationCode.idVerificationCode },
        data: { used: true },
      });

      const newAccessToken = jwt.sign(
        {
          idUser: userId,
          email: newEmail,
          role: user.role.toString(),
          password: user.password,
        },
        secretKey.secretKey
      );

      await prisma.users.update({
        where: { idUser: userId },
        data: { token: newAccessToken },
      });

      return { message: 'Email changed successfully' };
    } catch (error) {
      if (
        error instanceof ItemNotFoundException ||
        error instanceof AuthorizationException ||
        error instanceof ItemAlreadyExistsException ||
        error instanceof InvalidDataException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to change email');
    }
  }

  public async password_edit(data: z.infer<typeof UserSchema.changePassword>, key: z.infer<typeof UserSchema.token>): Promise<z.infer<typeof this.responseSchema>> {
    const { newPassword, oldPassword } = data;
    const { token } = key;

    try {
      const userId = await this.tokenService.userId(token);
      if (!userId) {
        throw new AuthorizationException('Not authorized');
      }

      const user = await prisma.users.findUnique({
        where: { idUser: userId },
      });

      if (!user) {
        throw new ItemNotFoundException('User not found');
      }

      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        throw new AuthorizationException('Incorrect password');
      }

      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      await prisma.users.update({
        where: { idUser: userId },
        data: { password: hashedPassword },
      });

      const newAccessToken = jwt.sign(
        {
          idUser: userId,
          email: user.email,
          role: user.role.toString(),
          password: hashedPassword,
        },
        secretKey.secretKey
      );

      await prisma.users.update({
        where: { idUser: userId },
        data: { token: newAccessToken },
      });

      return { message: 'Password updated successfully' };
    } catch (error) {
      if (
        error instanceof ItemNotFoundException ||
        error instanceof AuthorizationException ||
        error instanceof InvalidDataException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to edit password');
    }
  }

  public async register(data: z.infer<typeof UserSchema.registerUser>): Promise<z.infer<typeof UserSchema.authenticateResponse>> {
    const { name, email, password, code, telephone } = data;

    try {
      const verificationRecord = await prisma.verificationsCodes.findFirst({
        where: { code, email },
      });

      if (!verificationRecord) {
        throw new ForbiddenExceptionError('Invalid verification code');
      }

      if (verificationRecord.used) {
        throw new ItemAlreadyExistsException('Verification code already used');
      }

      const existingUser = await prisma.users.findUnique({ where: { email } });
      if (existingUser) {
        throw new ItemAlreadyExistsException('User already exists');
      }

      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = await prisma.users.create({
        data: {
          name,
          email,
          status: true,
          role: 3,
          token: '',
          phoneNumber:"",
          password: hashedPassword,
          createdIn: new Date(),
        },
      });

      const token = jwt.sign(
        {
          idUser: newUser.idUser,
          email: newUser.email,
          role: newUser.role,
          access_level: newUser.role,
        },
        secretKey.secretKey
      );

      await prisma.verificationsCodes.update({
        where: { idVerificationCode: verificationRecord.idVerificationCode },
        data: { used: true },
      });

      const adminUser = await prisma.users.findFirst({ where: { role: 0 } });
      if (adminUser) {
        await this.notification.add("User Registration", "A new user has registered on the platform", adminUser.idUser);
      }

      const path_name = Date.now() + '' + newUser.idUser;
      const newFolderPath = path.join(uploadsPath, path_name);
      fs.mkdirSync(newFolderPath, { recursive: true });

      await prisma.users.update({
        where: { idUser: newUser.idUser },
        data: { path: path_name, token },
      });

      return {
        accessToken: token,
        userRole: newUser.role,
        idUser: newUser.idUser,
      };
    } catch (error) {
      if (
        error instanceof ItemNotFoundException ||
        error instanceof ItemAlreadyExistsException ||
        error instanceof InvalidDataException || error instanceof ForbiddenExceptionError
      ) {
        console.log("Error:",error)
        throw error;
      }
       console.log("Error:",error)
      throw new InternalServerErrorException('An error occurred when trying to register user');
    }
  }

  public async update(data: z.infer<typeof UserSchema.updateUser>, key: z.infer<typeof UserSchema.token>): Promise<z.infer<typeof this.responseSchema>> {
    const { name, telephone, status } = data;
    const { token } = key;

    try {
      const isTokenValid = await this.tokenService.checkTokenUser(token);
      const userRole = await this.tokenService.userRole(token);
      if (!isTokenValid || userRole !== 5) {
        throw new AuthorizationException('Not authorized');
      }

      const userId = await this.tokenService.userId(token);
      if (!userId) {
        throw new AuthorizationException('Invalid user ID');
      }

      const user = await prisma.users.findUnique({ where: { idUser: userId } });
      if (!user) {
        throw new ItemNotFoundException('User not found');
      }

      await prisma.users.update({
        where: { idUser: user.idUser },
        data: {
          name,
          updatedIn: new Date(),
          phoneNumber: telephone || user.phoneNumber,
          status: status !== undefined ? status : user.status,
        },
      });

      return { message: 'User updated successfully' };
    } catch (error) {
      if (
        error instanceof AuthorizationException ||
        error instanceof ItemNotFoundException ||
        error instanceof InvalidDataException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to update user');
    }
  }

  public async delete(data: z.infer<typeof UserSchema.idUser>, key: z.infer<typeof UserSchema.token>): Promise<z.infer<typeof this.responseSchema>> {
    const { idUser } = data;
    const { token } = key;

    try {
      const userRole = await this.tokenService.userRole(token);
      const isTokenValid = await this.tokenService.checkTokenUser(token);
      if (!isTokenValid || userRole !== 0) {
        throw new AuthorizationException('Not authorized');
      }

      const targetUserId = idUser || (await this.tokenService.userId(token));
      if (!targetUserId) {
        throw new InvalidDataException('Invalid user ID');
      }

      const user = await prisma.users.findUnique({ where: { idUser: targetUserId } });
      if (!user) {
        throw new ItemNotFoundException('User not found');
      }

      if (user.role === 0) {
        throw new ForbiddenExceptionError('It is not allowed to delete the Administrator');
      }

      const userAdmin = await prisma.users.findFirst({ where: { role: 0 } });
      if (!userAdmin) {
        throw new ItemNotFoundException('Administrator not found, please contact a backend technician');
      }

      if (!idUser) {
        await this.notification.add('Account Deletion', 'A user has deleted their account from the platform', userAdmin.idUser);
      }

      await prisma.users.delete({ where: { idUser: targetUserId } });

      return { message: 'User deleted successfully' };
    } catch (error) {
      if (
        error instanceof AuthorizationException ||
        error instanceof ItemNotFoundException ||
        error instanceof ForbiddenExceptionError ||
        error instanceof InvalidDataException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to delete user');
    }
  }

  public async viewA(key: z.infer<typeof UserSchema.token>, req: FastifyRequest): Promise<z.infer<typeof UserSchema.user>> {
    const { token } = key;

    try {
      if (!await this.tokenService.checkTokenUser(token)) {
        throw new AuthorizationException('Not authorized');
      }

      const userId = await this.tokenService.userId(token);
      if (!userId) {
        throw new AuthorizationException('Invalid user ID');
      }

      const user = await prisma.users.findUnique({ where: { idUser: userId } });
      if (!user) {
        throw new ItemNotFoundException('User not found');
      }

      if (user.path && user.photo) {
        user.photo = this.fileService.generateLink('/users/' + user.path, req, user.photo);
      }

      return UserSchema.user.parse(user);
    } catch (error) {
      if (
        error instanceof AuthorizationException ||
        error instanceof ItemNotFoundException ||
        error instanceof InvalidDataException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to retrieve user');
    }
  }

  public async viewAll(key: z.infer<typeof UserSchema.token>): Promise<z.infer<typeof UserSchema.users>> {
    const { token } = key;

    try {
      const isTokenValid = await this.tokenService.checkTokenUser(token);
      const userRole = await this.tokenService.userRole(token);

      if (!isTokenValid || userRole !== 0) {
        throw new AuthorizationException('Not authorized');
      }

      const users = await prisma.users.findMany({
        where: {
          role: {
            not: 0,
          },
        },
      });

      return UserSchema.users.parse(users);
    } catch (error) {
      if (
        error instanceof AuthorizationException ||
        error instanceof InvalidDataException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to retrieve users');
    }
  }

  public async authenticate(data: z.infer<typeof UserSchema.authenticateUser>): Promise<z.infer<typeof UserSchema.authenticateResponse>> {
    const { password, email } = data;

    try {
      const user = await prisma.users.findUnique({ where: { email } });
      if (!user) {
        throw new ItemNotFoundException('User not found');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new AuthorizationException('Incorrect password');
      }

      const token = jwt.sign(
        { idUser: user.idUser, email: user.email, role: user.role },
        secretKey.secretKey
      );

      await prisma.users.update({
        where: { idUser: user.idUser },
        data: { token },
      });

      return {
        accessToken: token,
        userRole: user.role,
        idUser: user.idUser,
      };
    } catch (error) {
      if (
        error instanceof ItemNotFoundException ||
        error instanceof AuthorizationException ||
        error instanceof InvalidDataException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to authenticate');
    }
  }

  public async receive_code(data: z.infer<typeof UserSchema.receiveCode>): Promise<z.infer<typeof this.responseSchema>> {
    const { email } = data;

    try {
      const verificationCode = new GenerateVerificationCode().generate_code();

      await prisma.verificationsCodes.create({
        data: { email, code: verificationCode, used: false ,createdIn:new Date()},
      });

      const emailSent = await this.emailService.sendConfirmationCode(email, verificationCode);
      if (!emailSent) {
        throw new InternalServerErrorException('Error sending verification email');
      }

      return { message: 'Verification email sent successfully' };
    } catch (error) {
      if (error instanceof InvalidDataException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to send verification code');
    }
  }

  public async uploadPhoto(data: z.infer<typeof UserSchema.token>, file: any, req: FastifyRequest): Promise<z.infer<typeof UserSchema.uploadPhotoResponse>> {
    const { token } = data;

    try {
      if (!await this.tokenService.checkTokenUser(token)) {
        throw new AuthorizationException('Not authorized');
      }

      const userId = await this.tokenService.userId(token);
      if (!userId) {
        throw new InvalidDataException('Invalid ID');
      }

      const fileBuffer = await file.toBuffer();
      const fileName = Date.now() + path.extname(file.filename);

      const pathh = 'users/' + (await this.fileService.getPath(userId));
      if (!pathh) {
        throw new InvalidDataException('Invalid folder. Please reset the database.');
      }

      await this.fileService.saveFile(fileBuffer, fileName, pathh);

      const fileUrl = fileName;
      await prisma.users.update({
        where: { idUser: userId },
        data: { photo: fileUrl },
      });

      const generatedUrl = this.fileService.generateLink(pathh, req, fileName);

      return {
        url: generatedUrl,
      };
    } catch (error) {
      if (
        error instanceof AuthorizationException ||
        error instanceof InvalidDataException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred when trying to upload photo');
    }
  }
}

export default Users;