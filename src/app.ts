import express, { Express } from 'express';
import { LinkedInServer } from './setupServer';
import databaseConnection from './setupDatabase';
import { config } from './config';

class Application {
  public initialize(): void {
    this.loadConfig();
    databaseConnection();
    const app: Express = express();
    const server: LinkedInServer = new LinkedInServer(app);
    server.start();
  }
  public loadConfig(): void {
    config.validateConfig();
  }
}
const application: Application = new Application();
application.initialize();
