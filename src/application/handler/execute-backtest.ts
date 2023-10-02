import { Job } from 'bullmq';
import Backtest from '../../domain/runner/backtest';
import Timeframe from '../../domain/core/timeframe';
import Instrument from '../../domain/core/instrument';
import BacktestRepository from '../../domain/repository/backtest-repository';
import { ExchangeFactory } from '../exchange/exchange-factory';
import Handler from './handler';

export type BacktestJob = {
  id: string;
  startTime: Date;
  endTime: Date;
  timeframe: Timeframe;
  instrument: Instrument;
  strategyType: string;
  strategyParams: any;
};

export default class ExecuteBacktest implements Handler {
  readonly key = 'ExecuteBacktest';

  constructor(
    private readonly exchangeFactory: ExchangeFactory,
    private readonly backtestRepository: BacktestRepository
  ) {}

  async handle(job: Job<BacktestJob>) {
    const data = job.data;
    const backtest = new Backtest(
      data.id,
      new Date(data.startTime),
      new Date(data.endTime),
      this.exchangeFactory.createMdService(data.instrument.exchange.value),
      data.timeframe,
      data.instrument,
      data.strategyType,
      data.strategyParams
    );
    await backtest.start();
    await this.backtestRepository.update(backtest);
  }
}
