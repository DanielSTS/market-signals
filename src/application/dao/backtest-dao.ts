import { PositionState } from '../../domain/oms/position';
import { BacktestState } from '../../domain/runner/backtest';

export type PositionDto = {
  state: PositionState;
  enterTrade: {
    price: number;
    time: Date;
    quantity: number;
  };
  id: string;
  exitTrade?: {
    price: number;
    time: Date;
    quantity: number;
  };
};

export type BacktestDto = {
  id: string;
  startTime: Date;
  endTime: Date;
  symbol: string;
  exchange: string;
  timeframe: string;
  strategyType: string;
  strategyParams: any;
  state: BacktestState;
  positions: PositionDto[];
};

export default interface BacktestDao {
  getDtoById(id: string): Promise<BacktestDto>;
  getAllDto(): Promise<BacktestDto[]>;
}
