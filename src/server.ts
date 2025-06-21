import fastify, { FastifyInstance } from 'fastify';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { routes } from './routes/routes';
import { ZodError } from 'zod';
import swaggerCSS from './utils/swagger_ui';
import path from 'path';
import dotenv from 'dotenv';
import database from './config/DataBase';
import fastifyCors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import {
  validatorCompiler,
  serializerCompiler,
  jsonSchemaTransform,
  hasZodFastifySchemaValidationErrors
} from 'fastify-type-provider-zod';
import FileService from './services/StorageServices';
import { generalExceptionHandler } from './errors/GeneralExceptionHandler';

dotenv.config();

const uploadsPath = path.join(__dirname, '../storage');

class Server {
  private readonly PORT: number;
  private readonly HOST: string;
  private readonly app: FastifyInstance;

  constructor() {
    this.PORT = Number(process.env.SERVER_PORT) || 3000;
    this.HOST = process.env.SERVER_HOST || 'localhost';
    this.app = fastify();
    this.configure();
    this.registerRoutes();
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      await database.initialize();
 
    } catch (err) {
      console.error('Database connection failed:', err);
      process.exit(1);
    }
  }

  private configure() {
    this.app.setValidatorCompiler(validatorCompiler);
    this.app.setSerializerCompiler(serializerCompiler);

    new FileService().createFolderSystem();

    this.app.register(fastifyMultipart, {
      limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
    });

    this.app.register(fastifyCors, {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'token']
    });

    this.app.setNotFoundHandler((request, reply) => {
      reply.code(404).send({
        message: `Route ${request.method}:${request.url} was not found.`
      });
    });
    this.app.setErrorHandler((error, req, reply) => {
  
     
      if(error instanceof ZodError) {
        console.error('Zod validation error:', error.issues);
        const messages = error.issues.map(issue => {
          const field = issue.path.join('.') || 'field';
          return `Field "${field}" is required or invalid: ${issue.message}`;
        });
        return reply.status(400).send({
          message: 'Validation error in request body.',
          fields: messages
        });

      }

      
    if (error.code === 'FST_ERR_VALIDATION' && error.validation) {
      const camposInvalidos = error.validation.map((v: any) => {
        if (v.message) {
            return v.message;
        }
        const caminho = v.instancePath?.replace(/^\//, '') || v.params?.missingProperty || 'field';
        return `Field "${caminho}" is required or invalid.`;
    });
       
      if (error instanceof ZodError) {
        const messages = error.issues.map(issue => {
          const field = issue.path.join('.') || 'field';
          console.log(`🚫 Campo "${field}" com erro: ${issue.message}`);
          return {
            field,
            message: issue.message
          };
        });
        console.log(messages)
      }

      return reply.status(400).send({
        message: 'Validation error in request body.',
        fields: camposInvalidos
      });
    }

    generalExceptionHandler(error, req, reply);
    if (reply.sent) {
    
      return;
    }
      // Handler personalizado inicial
      generalExceptionHandler(error, req, reply);
      if (reply.sent) {
        return;
      } 
      // 1️⃣ Zod validation errors
      if (error instanceof ZodError) {
        console.log('🟠 Erro de validação Zod detectado');
        const messages = error.issues.map(i => {
          const field = i.path.join('.') || 'field';
          return `Field "${field}" is required or invalid.`;
        });
        return reply.status(400).send({
          message: 'Validation error in request data.',
          filds:messages
        });
      }
      // 2️⃣ Fastify request validation fallback
      if (error.validation) {
        console.log('🟡 Erro de validação Fastify detectado');
        const messages = error.validation.map((err: any) => {
          const p = err.instancePath?.slice(1) || err.params?.missingProperty || 'field';
          console.log(`🚫 Campo inválido: ${p}`);
          return `Field "${p}" is required or invalid.`;
        });
        return reply.status(400).send({
          message: 'Validation error in request data.',
        });
      }

      // 3️⃣ fastify-type-provider-zod response validation
      if (hasZodFastifySchemaValidationErrors(error)) {
        return reply.status(500).send({
          message: `Response validation failed. ${error.validation ? String(error.validation) : ''}`,
        });
      }
      // 4️⃣ JSON serialization errors
      if (error.code === 'FST_ERR_RESPONSE_SERIALIZATION') {
        return reply.status(500).send({
          message: 'Unexpected response format. Check the response schema.'
        });
      }
      // 5️⃣ Bad JSON syntax in body
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        return reply.status(400).send({
          message: `Invalid JSON format: ${error.message}`
        });
      }

      // 6️⃣ Default fallback
      return reply.status(error.statusCode || 500).send({
        message: error.message || 'Unexpected server error'
      });
    });


    this.app.register(fastifySwagger, {
      openapi: {
        info: {
          title: 'Ordering System  API',
          version: '1.0.0',
          description: process.env.API_DESCRIPTION || 'API Documentation'
        },
        servers: [{ url: `http://${this.HOST}:${this.PORT}`, description: 'Development server' }]
      },
      transform: jsonSchemaTransform
    });

    this.app.register(fastifySwaggerUi, {
      routePrefix: '/docs',
      theme: {
        title: 'Ordering System  API',
        css: [{ filename: 'theme.css', content: swaggerCSS }]
      }
    });
  }

  private registerRoutes() {
    this.app.register(fastifyStatic, {
      root: uploadsPath,
      prefix: '/uploads',
      decorateReply: false
    });
    this.app.register(routes, { prefix: '/api' });
  }

  public async start() {
    try {
      await this.app.listen({
        port: this.PORT,
        host: '0.0.0.0',
        listenTextResolver: addr => `Server is running at ${addr}`
      });
      console.log(`Server running at http://${this.HOST}:${this.PORT}`);
      console.log(`Docs: http://${this.HOST}:${this.PORT}/docs`);
    } catch (err) {
      console.error('Error starting server:', err);
      process.exit(1);
    }
  }
}

const server = new Server();
server.start().catch(err => {
  console.error('Server failed to start:', err);
  process.exit(1);
});