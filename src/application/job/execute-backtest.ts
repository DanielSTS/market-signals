import { Job } from 'bullmq';
import Backtest from '../../domain/runner/backtest';
import Timeframe from '../../domain/core/timeframe';
import Instrument from '../../domain/core/instrument';
import { MdService } from '../../domain/market-data/md.service';

export type BacktestJob = {
  id: string;
  startTime: Date;
  endTime: Date;
  timeframe: Timeframe;
  instrument: Instrument;
  strategyType: string;
  strategyParams: any;
};

export default class ExecuteBacktest {
  static readonly key = 'ExecuteBacktest';

  constructor(private readonly mdService: MdService) {}

  async handle(job: Job<BacktestJob>) {
    const data = job.data;
    const backtest = new Backtest(
      data.id,
      new Date(data.startTime),
      new Date(data.endTime),
      this.mdService,
      data.timeframe,
      data.instrument,
      data.strategyType,
      data.strategyParams
    );
    console.log('Job executing...');
    await backtest.start();
    console.log('Job executed!');
  }
}
