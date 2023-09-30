import BacktestRepository from '../../domain/repository/backtest-repository';
import Exchange from '../../domain/core/exchange';
import InstrumentRepository from '../../domain/repository/instrument-repository';
import Timeframe from '../../domain/core/timeframe';
import { MdService } from '../../domain/market-data/md.service';
import Backtest from '../../domain/runner/backtest';
import crypto from 'crypto';
import { BullQueue } from '../../infra/bull-queue';

export default class CreateBacktest {
  constructor(
    private readonly instrumentRepository: InstrumentRepository,
    private readonly backtestRepository: BacktestRepository,
    private readonly mdService: MdService,
    private readonly bullQueue: BullQueue
  ) {}
  async execute(input: Input): Promise<string> {
    const exchange = new Exchange(input.exchange);
    const timeframe = new Timeframe(input.timeframe);
    const instrument = await this.instrumentRepository.getBySymbolAndExchange(
      input.symbol,
      exchange.value
    );
    if (!instrument) {
      throw new Error('Instrument not found.');
    }
    const id = crypto.randomUUID().toString();
    const backtest = new Backtest(
      id,
      input.startTime,
      input.endTime,
      this.mdService,
      timeframe,
      instrument,
      input.strategyType,
      input.strategyParams
    );
    await this.backtestRepository.save(backtest);
    await this.bullQueue.add('ExecuteBacktest', backtest, {
      attempts: 3,
      priority: 1,
      delay: 1000
    });
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