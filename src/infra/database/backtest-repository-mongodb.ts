import { Collection, Db } from 'mongodb';
import BacktestRepository from '../../domain/repository/backtest-repository';
import Backtest from '../../domain/runner/backtest';
import Timeframe from '../../domain/core/timeframe';
import Instrument from '../../domain/core/instrument';
import Exchange from '../../domain/core/exchange';
import MdServiceFactory from '../../application/exchange/exchange-factory';
import BacktestDao, {
  BacktestDto,
  PositionDto
} from '../../application/dao/backtest-dao';

export default class BacktestRepositoryMongoDb
  implements BacktestRepository, BacktestDao
{
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
      positions: backtest.positions
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
          positions: backtest.positions
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

  async getDtoById(id: string): Promise<BacktestDto> {
    try {
      const backtest = await this.collection.findOne({ id: id });
      if (!backtest) {
        throw new Error('Backtest not found');
      }
      return BacktestRepositoryMongoDb.mapBacktestDto(backtest);
    } catch (error) {
      throw new Error(`Error getting backtest from MongoDB: ${error}`);
    }
  }

  async getAllDto(): Promise<BacktestDto[]> {
    try {
      const backtest = await this.collection.find().toArray();
      return backtest.map(BacktestRepositoryMongoDb.mapBacktestDto);
    } catch (error) {
      throw new Error(`Error getting backtests from MongoDB: ${error}`);
    }
  }

  static mapBacktestDto(backtest: any): BacktestDto {
    return {
      id: backtest.id,
      startTime: backtest.startTime,
      endTime: backtest.endTime,
      symbol: backtest.symbol,
      exchange: backtest.exchange,
      timeframe: backtest.timeframe,
      strategyType: backtest.strategyType,
      strategyParams: backtest.strategyParams,
      state: backtest.startTime,
      positions: backtest.positions.map(
        BacktestRepositoryMongoDb.mapPositionDto
      )
    };
  }

  static mapPositionDto(position: any): PositionDto {
    return {
      state: position._state,
      enterTrade: {
        price: position.enterTrade.price,
        time: position.enterTrade.time,
        quantity: position.enterTrade.quantity
      },
      id: position.id,
      exitTrade: {
        price: position.exitTrade.price,
        time: position.exitTrade.time,
        quantity: position.exitTrade.quantity
      }
    };
  }
}
