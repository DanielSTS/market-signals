import BacktestDao, { BacktestDto } from '../dao/backtest-dao';

export default class GetBacktestById {
  constructor(private readonly backtestDao: BacktestDao) {}
  async execute(input: Input): Promise<BacktestDto> {
    return this.backtestDao.getDtoById(input.id);
  }
}

type Input = {
  id: string;
};
