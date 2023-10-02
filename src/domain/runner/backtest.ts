import Runner from './runner';
import { MdService } from '../market-data/md.service';
import crypto from 'crypto';
import Timeframe from '../core/timeframe';
import Instrument from '../core/instrument';
import Position from '../oms/position';

type BacktestState = 'WAITING' | 'RUNNING' | 'EXECUTED' | 'FAILED';

export default class Backtest extends Runner {
  private _state: BacktestState;
  constructor(
    readonly id: string,
    readonly startTime: Date,
    readonly endTime: Date,
    private readonly mdService: MdService,
    timeframe: Timeframe,
    instrument: Instrument,
    strategyType: string,
    strategyParams: any,
    state: BacktestState = 'WAITING'
  ) {
    super(timeframe, instrument, strategyType, strategyParams);
    this._state = state;
  }

  get state(): BacktestState {
    return this._state;
  }

  get positions(): Position[] {
    return this.strategy.getPositions();
  }
  async start() {
    try {
      this._state = 'RUNNING';
      const history = await this.mdService.getCandlestick(
        this.instrument.symbol,
        this.timeframe,
        this.startTime,
        this.endTime
      );

      await Promise.all(
        history.map((candlestick, index) => {
          const candlesticks = history.slice(0, index + 1);
          return this.strategy.onCandlestick(candlesticks);
        })
      );

      this.printPositions();
      this.printProfit();
      this._state = 'EXECUTED';
    } catch (error) {
      this._state = 'FAILED';
      console.log(error);
    }
  }

  onBuySignal(price: number, time: Date) {
    const id = crypto.randomUUID().toString();
    void this.strategy.positionOpened(price, time, 1.0, id);
  }

  onSellSignal(
    price: number,
    quantity: number,
    time: Date,
    position: Position
  ) {
    void this.strategy.positionClosed(price, time, quantity, position.id);
  }
}
