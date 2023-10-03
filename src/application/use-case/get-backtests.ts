import BacktestDao, { BacktestDto } from '../dao/backtest-dao';

export default class GetBacktests {
  constructor(private readonly backtestDao: BacktestDao) {}
  async execute(): Promise<BacktestDto[]> {
    return this.backtestDao.getAllDto();
  }
}
