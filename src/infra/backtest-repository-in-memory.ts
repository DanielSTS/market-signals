import BacktestRepository from '../domain/core/backtest-repository';
import Backtest from '../domain/runner/backtest';

export default class InMemoryBacktestRepository implements BacktestRepository {
  private backtests: Backtest[] = [];

  async save(backtest: Backtest): Promise<void> {
    this.backtests.push(backtest);
  }

  async getById(id: string): Promise<Backtest | undefined> {
    return this.backtests.find(backtest => backtest.id === id);
  }
}
