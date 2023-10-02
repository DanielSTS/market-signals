import BacktestRepository from '../../domain/repository/backtest-repository';
import QueueAdapter from '../../infra/queue/queue-adapter';
import Handler from './handler';

export type BacktestJob = {
  id: string;
};

export default class ExecuteBacktest implements Handler {
  readonly key = 'ExecuteBacktest';

  constructor(
    private readonly backtestRepository: BacktestRepository,
    private readonly queue: QueueAdapter
  ) {}

  async handle(data: BacktestJob): Promise<void> {
    const backtest = await this.backtestRepository.getById(data.id);
    await backtest.start();
    await this.backtestRepository.update(backtest);
    await this.queue.add('CalculateStats', data);
  }
}
