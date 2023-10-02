import BacktestRepository from '../../domain/repository/backtest-repository';
import Exchange from '../../domain/core/exchange';
import InstrumentRepository from '../../domain/repository/instrument-repository';
import Timeframe from '../../domain/core/timeframe';
import Backtest from '../../domain/runner/backtest';
import crypto from 'crypto';
import { BacktestJob } from '../handler/execute-backtest';
import QueueAdapter from '../../infra/queue/queue-adapter';
import { ExchangeFactory } from '../exchange/exchange-factory';

export default class CreateBacktest {
  constructor(
    private readonly instrumentRepository: InstrumentRepository,
    private readonly backtestRepository: BacktestRepository,
    private readonly mdServiceFactory: ExchangeFactory,
    private readonly queue: QueueAdapter
  ) {}
  async execute(input: Input): Promise<string> {
    const exchange = new Exchange(input.exchange);
    const timeframe = new Timeframe(input.timeframe);
    const instrument = await this.instrumentRepository.getBySymbolAndExchange(
      input.symbol,
      exchange.value
    );
    const id = crypto.randomUUID().toString();
    const backtest = new Backtest(
      id,
      input.startTime,
      input.endTime,
      this.mdServiceFactory.createMdService(exchange.value),
      timeframe,
      instrument,
      input.strategyType,
      input.strategyParams
    );
    await this.backtestRepository.save(backtest);
    const backtestJob: BacktestJob = {
      id
    };
    await this.queue.add('ExecuteBacktest', backtestJob);
    return id;
  }
}

type Input = {
  exchange: string;
  symbol: string;
  timeframe: string;
  startTime: Date;
  endTime: Date;
  strategyType: string;
  strategyParams: any;
};
