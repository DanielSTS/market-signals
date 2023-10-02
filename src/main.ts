import EventEmitter from 'events';
import WsAdapter from './infra/ws-adapter';
import AxiosAdapter from './infra/axios-adapter';
import FoxbitMdService from './application/exchange/foxbit-md-service';
import CreateBacktest from './application/use-case/create-backtest';
import InMemoryInstrumentRepository from './infra/instrument-repository-in-memory';
import InMemoryBacktestRepository from './infra/backtest-repository-in-memory';
import { Queue, Worker } from 'bullmq';
import { ExecuteBacktest } from './application/job';

async function main() {
  const eventEmitter = new EventEmitter();

  const wsFoxbit = new WsAdapter('wss://api.foxbit.com.br/');
  const restFoxbit = new AxiosAdapter('https://api.foxbit.com.br/rest/v3/');
  const mdFoxbit = new FoxbitMdService(eventEmitter, wsFoxbit, restFoxbit);
  const instrumentRepository = new InMemoryInstrumentRepository();
  const backtestRepository = new InMemoryBacktestRepository();

  const executeBacktest = new ExecuteBacktest(mdFoxbit);

  new Worker(
    ExecuteBacktest.key,
    executeBacktest.handle.bind(executeBacktest),
    {}
  );
  const bullQueue = new Queue(ExecuteBacktest.key);

  const createBacktest = new CreateBacktest(
    instrumentRepository,
    backtestRepository,
    mdFoxbit,
    bullQueue
  );

  await createBacktest.execute({
    exchange: 'foxbit',
    symbol: 'btcbrl',
    timeframe: '1h',
    startTime: new Date('2022-07-18T00:00'),
    endTime: new Date('2022-08-19T12:00'),
    strategyType: 'bb',
    strategyParams: {}
  });

  console.log('Backtest created and work added successfully!');
}

main();
