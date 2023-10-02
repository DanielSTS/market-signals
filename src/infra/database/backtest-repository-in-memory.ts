import BacktestRepository from '../../domain/repository/backtest-repository';
import Backtest from '../../domain/runner/backtest';

export default class InMemoryBacktestRepository implements BacktestRepository {
  private backtests: Backtest[] = [];

  async save(backtest: Backtest): Promise<void> {
    this.backtests.push(backtest);
  }

  async update(backtest: Backtest): Promise<void> {
    const index = this.backtests.findIndex(
      backtest => backtest.id === backtest.id
    );
    this.backtests[index] = backtest;
  }

  async getById(id: string): Promise<Backtest> {
    const backtest = this.backtests.find(backtest => backtest.id === id);
    if (backtest) {
      return backtest;
    }
    throw new Error('Backtest not found');
  }
}
