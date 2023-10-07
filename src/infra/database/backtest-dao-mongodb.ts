import { Collection, Db } from 'mongodb';
import BacktestDao, {
  BacktestDto,
  PositionDto
} from '../../application/dao/backtest-dao';

export default class BacktestDaoMongoDb implements BacktestDao {
  private readonly collection: Collection;

  constructor(db: Db) {
    this.collection = db.collection('backtests');
  }

  async getDtoById(id: string): Promise<BacktestDto> {
    try {
      const backtest = await this.collection.findOne({ id: id });
      if (!backtest) {
        throw new Error('Backtest not found');
      }
      return BacktestDaoMongoDb.mapBacktestDto(backtest);
    } catch (error) {
      throw new Error(`Error getting backtest from MongoDB: ${error}`);
    }
  }

  async getAllDto(): Promise<BacktestDto[]> {
    try {
      const backtest = await this.collection.find().toArray();
      return backtest.map(BacktestDaoMongoDb.mapBacktestDto);
    } catch (error) {
      throw new Error(`Error getting backtests from MongoDB: ${error}`);
    }
  }

  static mapBacktestDto(backtest: any): BacktestDto {
    return {
      id: backtest.id,
      startTime: backtest.startTime,
      endTime: backtest.endTime,
      symbol: backtest.instrument.symbol,
      exchange: backtest.instrument.exchange.value,
      timeframe: backtest.timeframe.value,
      strategyType: backtest.strategyType,
      strategyParams: backtest.strategyParams,
      state: backtest.state,
      positions: backtest.positions.map(BacktestDaoMongoDb.mapPositionDto)
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
      exitTrade: position.exitTrade && {
        price: position.exitTrade.price,
        time: position.exitTrade.time,
        quantity: position.exitTrade.quantity
      }
    };
  }
}
