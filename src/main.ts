import EventEmitter from 'events';
import WsAdapter from './infra/web/ws-adapter';
import AxiosAdapter from './infra/web/axios-adapter';
import FoxbitMdService from './application/exchange/foxbit-md-service';
import CreateBacktest from './application/use-case/create-backtest';
import InMemoryInstrumentRepository from './infra/database/instrument-repository-in-memory';
import InMemoryBacktestRepository from './infra/database/backtest-repository-in-memory';
import ExecuteBacktest from './application/job/execute-backtest';
import { BullMQAdapter } from './infra/queue/bullmq-adapter';
import 'dotenv/config';

async function main() {
  const eventEmitter = new EventEmitter();

  const wsFoxbit = new WsAdapter('wss://api.foxbit.com.br/');
  const restFoxbit = new AxiosAdapter('https://api.foxbit.com.br/rest/v3/');
  const mdFoxbit = new FoxbitMdService(eventEmitter, wsFoxbit, restFoxbit);
  const instrumentRepository = new InMemoryInstrumentRepository();
  const backtestRepository = new InMemoryBacktestRepository();

  const bullQueue = new BullMQAdapter(ExecuteBacktest.key);

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
