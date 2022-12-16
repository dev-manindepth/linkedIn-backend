import { Application, Response, Request, NextFunction, json, urlencoded } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import cookieSession from 'cookie-session';
import HTTP_STATUS from 'http-status-codes';
import compression from 'compression';
import 'express-async-errors';
import http from 'http';
import { config } from './config';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import applicationRoutes from './routes';
import { CustomError, IErrorResponse } from './shared/globals/helpers/error-handler';
import Logger from 'bunyan';

const log: Logger = config.createLogger('setupServer');

const SERVER_PORT = 8000;
export class LinkedInServer {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public start(): void {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routeMiddleware(this.app);
    this.globalErrorHanlder(this.app);
    this.startServer(this.app);
  }

  private securityMiddleware(app: Application): void {
    app.use(
      cors({
        origin: '*',
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      })
    );
    app.use(hpp());
    app.use(helmet());
    app.use(
      cookieSession({
        name: 'session',
        keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
    );
  }

  private standardMiddleware(app: Application): void {
    app.use(compression());
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));
  }

  private routeMiddleware(app: Application): void {
    applicationRoutes(app);
  }
  private globalErrorHanlder(app: Application): void {
    app.use('*', (req: Request, res: Response) => {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: `${req.originalUrl} not found` });
    });

    app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      log.error(error);
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json(error.serializeErrors());
      }
      next();
    });
  }
  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      const socketIO: Server = await this.createSocketIOServer(httpServer);
      this.startHttpServer(httpServer);
      this.socketIOConnection(socketIO);
    } catch (err) {
      log.error(err);
    }
  }
  private async createSocketIOServer(httpServer: http.Server): Promise<Server> {
    const io: Server = new Server(httpServer, {
      cors: {
        origin: config.CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      }
    });
    const pubClient = createClient({ url: config.REDIS_HOST });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    return io;
  }
  private startHttpServer(htttpServer: http.Server): void {
    log.info(`Server has started with process ${process.pid}`);
    htttpServer.listen(SERVER_PORT, () => {
      log.info(`Server running on port ${SERVER_PORT}`);
    });
  }
  private socketIOConnection(io: Server): void {}
}
