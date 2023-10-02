import EventEmitter from 'events';
import { Worker } from 'bullmq';
import ExecuteBacktest from './application/job/execute-backtest';
import 'dotenv/config';
import redisConfig from './infra/queue/redis-config';
import MdServiceFactory from './application/exchange/exchange-factory';
import BacktestRepositoryMongoDb from './infra/database/backtest-repository-mongodb';
import { MongoClient } from 'mongodb';
import mongodbConfig from './infra/database/mongodb-config';

async function main() {
  const eventEmitter = new EventEmitter();
  const mdServiceFactory = new MdServiceFactory(eventEmitter);

  const client = new MongoClient(mongodbConfig.MONGO_URI);
  await client.connect();
  const db = client.db();
  const backtestRepository = new BacktestRepositoryMongoDb(
    db,
    mdServiceFactory
  );
  const executeBacktest = new ExecuteBacktest(
    mdServiceFactory,
    backtestRepository
  );

  new Worker(
    ExecuteBacktest.key,
    executeBacktest.handle.bind(executeBacktest),
    {
      connection: redisConfig
    }
  );
}

main();
