import { Collection, Db } from 'mongodb';
import BacktestRepository from '../../domain/repository/backtest-repository';
import Backtest from '../../domain/runner/backtest';
import Timeframe from '../../domain/core/timeframe';
import Instrument from '../../domain/core/instrument';
import Exchange from '../../domain/core/exchange';
import MdServiceFactory from '../../application/exchange/exchange-factory';

export default class BacktestRepositoryMongoDb implements BacktestRepository {
  private readonly collection: Collection;

  constructor(
    db: Db,
    private readonly mdServiceFactory: MdServiceFactory
  ) {
    this.collection = db.collection('backtests');
  }
  async save(backtest: Backtest): Promise<void> {
    await this.collection.insertOne({
      id: backtest.id,
      startTime: backtest.startTime,
      endTime: backtest.endTime,
      timeframe: backtest.timeframe,
      instrument: backtest.instrument,
      strategyType: backtest.strategyType,
      strategyParams: backtest.strategyParams,
      state: backtest.state,
      positions: backtest.positions,
      stats: backtest.stats
    });
  }

  async update(backtest: Backtest): Promise<void> {
    await this.collection.updateOne(
      { id: backtest.id },
      {
        $set: {
          startTime: backtest.startTime,
          endTime: backtest.endTime,
          timeframe: backtest.timeframe,
          instrument: backtest.instrument,
          strategyType: backtest.strategyType,
          strategyParams: backtest.strategyParams,
          state: backtest.state,
          positions: backtest.positions,
          stats: backtest.stats
        }
      }
    );
  }
  async getById(id: string): Promise<Backtest> {
    try {
      const backtest = await this.collection.findOne({ id: id });
      if (!backtest) {
        throw new Error('Backtest not found');
      }
      const exchange = new Exchange(backtest.instrument.exchange.value);
      const instrument = new Instrument(
        backtest.instrument.symbol,
        exchange,
        backtest.instrument.minQuantity,
        backtest.instrument.priceIncrement
      );
      const mdService = this.mdServiceFactory.createMdService(
        backtest.instrument.exchange.value
      );
      const timeframe = new Timeframe(backtest.timeframe.value);
      return new Backtest(
        backtest.id,
        backtest.startTime,
        backtest.endTime,
        mdService,
        timeframe,
        instrument,
        backtest.strategyType,
        backtest.strategyParams,
        backtest.state
      );
    } catch (error) {
      throw new Error(`Error getting backtest from MongoDB: ${error}`);
    }
  }
}
