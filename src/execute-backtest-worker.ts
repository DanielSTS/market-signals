import EventEmitter from 'events';
import { Job, Worker } from 'bullmq';
import ExecuteBacktest, {
  BacktestJob
} from './application/handler/execute-backtest';
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
  const executeBacktest = new ExecuteBacktest(backtestRepository);

  new Worker(
    executeBacktest.key,
    async (job: Job<BacktestJob>) => {
      await executeBacktest.handle(job.data);
    },
    {
      connection: redisConfig
    }
  );
}

main();
