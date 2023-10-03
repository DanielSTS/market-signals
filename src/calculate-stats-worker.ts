import EventEmitter from 'events';
import { Job, Worker } from 'bullmq';
import 'dotenv/config';
import redisConfig from './infra/queue/redis-config';
import MdServiceFactory from './application/exchange/exchange-factory';
import BacktestRepositoryMongoDb from './infra/database/backtest-repository-mongodb';
import { MongoClient } from 'mongodb';
import mongodbConfig from './infra/database/mongodb-config';
import CalculateStats, {
  CalculateStatsJob
} from './application/handler/calculate-stats';

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
  const calculateStats = new CalculateStats(backtestRepository);

  const worker = new Worker(
    calculateStats.key,
    async (job: Job<CalculateStatsJob>) => {
      await calculateStats.handle(job.data);
    },
    {
      connection: redisConfig
    }
  );

  worker.on('failed', (job, error: Error) => {
    console.log(job, error);
  });
}

main();
