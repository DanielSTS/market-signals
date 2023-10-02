import BacktestDao from '../dao/backtest-dao';
import Handler from './handler';

export type CalculateStatsJob = {
  id: string;
};

export default class CalculateStats implements Handler {
  readonly key = 'CalculateStats';

  constructor(private readonly backtestRepository: BacktestDao) {}

  async handle(data: CalculateStatsJob): Promise<void> {
    console.log(data);
    const backtest = await this.backtestRepository.getDtoById(data.id);
    console.log(backtest);
  }
}
