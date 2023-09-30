import { Job } from 'bull';
import Backtest from '../../domain/runner/backtest';

export default class ExecuteBacktest {
  static readonly key = 'ExecuteBacktest';

  static async handle(backtest: Job<Backtest>) {
    console.log(backtest);
  }
}
