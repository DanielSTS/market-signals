import EventEmitter from 'events';
import CreateBacktest from './application/use-case/create-backtest';
import InMemoryInstrumentRepository from './infra/database/instrument-repository-in-memory';
import { BullMQAdapter } from './infra/queue/bullmq-adapter';
import 'dotenv/config';
import BacktestRepositoryMongoDb from './infra/database/backtest-repository-mongodb';
import { MongoClient } from 'mongodb';
import mongodbConfig from './infra/database/mongodb-config';
import MdServiceFactory from './application/exchange/exchange-factory';

async function main() {
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
  const createBacktest = new CreateBacktest(
    instrumentRepository,
    backtestRepository,
    mdServiceFactory,
    bullQueue
  );
  await createBacktest.execute({
    exchange: 'foxbit',
    symbol: 'btcbrl',
    timeframe: '1h',
    startTime: new Date('2022-07-18T00:00'),
    endTime: new Date('2022-08-19T12:00'),
    strategyType: 'bollinger-bands',
    strategyParams: {}
  });
  console.log('Backtest created and job added successfully!');
}

main();
