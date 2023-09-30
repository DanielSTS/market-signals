import { Backtest } from '../runner/backtest';

export default interface BacktestRepository {
  save(backtest: Backtest): void;
  getById(id: string): Backtest | undefined;
}
