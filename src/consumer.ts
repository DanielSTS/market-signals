import EventEmitter from 'events';
import WsAdapter from './infra/ws-adapter';
import AxiosAdapter from './infra/axios-adapter';
import FoxbitMdService from './application/exchange/foxbit-md-service';
import { Worker } from 'bullmq';
import ExecuteBacktest from './application/job/execute-backtest';
import 'dotenv/config';
import redisConfig from './infra/redis-config';

async function main() {
  const eventEmitter = new EventEmitter();
  const wsFoxbit = new WsAdapter('wss://api.foxbit.com.br/');
  const restFoxbit = new AxiosAdapter('https://api.foxbit.com.br/rest/v3/');
  const mdFoxbit = new FoxbitMdService(eventEmitter, wsFoxbit, restFoxbit);

  const executeBacktest = new ExecuteBacktest(mdFoxbit);

  new Worker(
    ExecuteBacktest.key,
    executeBacktest.handle.bind(executeBacktest),
    {
      connection: redisConfig
    }
  );
}

main();
