import { MongoClient } from 'mongodb';
import { EventEmitter } from 'ws';
import MdServiceFactory from './application/exchange/exchange-factory';
import CreateBacktest from './application/use-case/create-backtest';
import BacktestRepositoryMongoDb from './infra/database/backtest-repository-mongodb';
import InMemoryInstrumentRepository from './infra/database/instrument-repository-in-memory';
import mongodbConfig from './infra/database/mongodb-config';
import { BullMQAdapter } from './infra/queue/bullmq-adapter';
import GetBacktests from './application/use-case/get-backtests';
import GetBacktestById from './application/use-case/get-backtests-by-id';

export default class UseCaseFactory {
  static async CreateBacktest() {
    const eventEmitter = new EventEmitter();
    const instrumentRepository = new InMemoryInstrumentRepository();
    const mdServiceFactory = new MdServiceFactory(eventEmitter);

    const client = new MongoClient(mongodbConfig.MONGO_URI);
    await client.connect();
    const db = client.db();
    const backtestRepository = new BacktestRepositoryMongoDb(
      db,
      mdServiceFactory
    );
    const bullQueue = new BullMQAdapter('ExecuteBacktest');
    return new CreateBacktest(
      instrumentRepository,
      backtestRepository,
      mdServiceFactory,
      bullQueue
    );
  }

  static async GetBacktests() {
    const eventEmitter = new EventEmitter();
    const mdServiceFactory = new MdServiceFactory(eventEmitter);

    const client = new MongoClient(mongodbConfig.MONGO_URI);
    await client.connect();
    const db = client.db();
    const backtestRepository = new BacktestRepositoryMongoDb(
      db,
      mdServiceFactory
    );
    return new GetBacktests(backtestRepository);
  }

  static async GetBacktestById() {
    const eventEmitter = new EventEmitter();
    const mdServiceFactory = new MdServiceFactory(eventEmitter);

    const client = new MongoClient(mongodbConfig.MONGO_URI);
    await client.connect();
    const db = client.db();
    const backtestRepository = new BacktestRepositoryMongoDb(
      db,
      mdServiceFactory
    );
    return new GetBacktestById(backtestRepository);
  }
}
