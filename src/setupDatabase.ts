import mongoose from 'mongoose';
import { config } from './config';
import Logger from 'bunyan';

const log: Logger = config.createLogger('setupDatabase');

export default () => {
  const connect = () => {
    mongoose.set('strictQuery', false);
    mongoose
      .connect(config.DATABASE_URL!)
      .then(() => log.info('Successfully connected to db'))
      .catch((err) => log.error(`Error while connecting to db ${err}`));
  };
  connect();
  mongoose.connection.on('disconnected', connect);
};
