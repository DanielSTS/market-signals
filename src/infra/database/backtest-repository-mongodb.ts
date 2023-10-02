import { Collection, Db, ObjectId } from 'mongodb';
import BacktestRepository from '../../domain/repository/backtest-repository';
import Backtest from '../../domain/runner/backtest';

export default class BacktestRepositoryMongoDb implements BacktestRepository {
  private readonly collection: Collection;
  constructor(db: Db) {
    this.collection = db.collection('backtests');
  }
  save(backtest: Backtest): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async getById(id: string): Promise<Backtest> {
    try {
      const backtest = await this.collection.findOne({ _id: new ObjectId(id) });
      if (backtest) {
        return new Backtest(
          backtest.id,
          backtest.startTime,
          backtest.endTime,
          backtest.mdService,
          backtest.timeframe,
          backtest.instrument,
          backtest.strategyType,
          backtest.strategyParams
        );
      }
      throw new Error('Backtest not found');
    } catch (error) {
      throw new Error(`Error getting backtest from MongoDB: ${error}`);
    }
  }
}
