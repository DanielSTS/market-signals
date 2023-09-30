import BacktestRepository from '../domain/core/backtest-repository';
import { Backtest } from '../domain/runner/backtest';

export class InMemoryBacktestRepository implements BacktestRepository {
  private backtests: Backtest[] = [];

  save(backtest: Backtest): void {
    this.backtests.push(backtest);
  }

  getById(id: string): Backtest | undefined {
    return this.backtests.find(backtest => backtest.id === id);
  }
}
