import EventEmitter from 'events';
import WsAdapter from './infra/web/ws-adapter';
import AxiosAdapter from './infra/web/axios-adapter';
import FoxbitMdService from './application/exchange/foxbit-md-service';
import { Worker } from 'bullmq';
import ExecuteBacktest from './application/job/execute-backtest';
import 'dotenv/config';
import redisConfig from './infra/queue/redis-config';
import InMemoryBacktestRepository from './infra/database/backtest-repository-in-memory';

async function main() {
  const eventEmitter = new EventEmitter();
  const wsFoxbit = new WsAdapter('wss://api.foxbit.com.br/');
  const restFoxbit = new AxiosAdapter('https://api.foxbit.com.br/rest/v3/');
  const mdFoxbit = new FoxbitMdService(eventEmitter, wsFoxbit, restFoxbit);
  const backtestRepository = new InMemoryBacktestRepository();

  const executeBacktest = new ExecuteBacktest(mdFoxbit, backtestRepository);

  new Worker(
    ExecuteBacktest.key,
    executeBacktest.handle.bind(executeBacktest),
    {
      connection: redisConfig
    }
  );
}

main();
