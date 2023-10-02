import Backtest from '../runner/backtest';

export default interface BacktestRepository {
  save(backtest: Backtest): Promise<void>;
  update(backtest: Backtest): Promise<void>;
  getById(id: string): Promise<Backtest>;
}
