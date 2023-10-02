import Runner from './runner';
import { MdService } from '../market-data/md.service';
import crypto from 'crypto';
import Timeframe from '../core/timeframe';
import Instrument from '../core/instrument';
import Position from '../oms/position';

type BacktestState = 'WAITING' | 'RUNNING' | 'EXECUTED' | 'FAILED';

export default class Backtest extends Runner {
  private state: BacktestState = 'WAITING';
  private positions: Position[] = [];
  constructor(
    readonly id: string,
    readonly startTime: Date,
    readonly endTime: Date,
    private readonly mdService: MdService,
    timeframe: Timeframe,
    instrument: Instrument,
    strategyType: string,
    strategyParams: any
  ) {
    super(timeframe, instrument, strategyType, strategyParams);
  }

  get State(): BacktestState {
    return this.state;
  }
  async start() {
    try {
      this.state = 'RUNNING';
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
      this.positions = this.strategy.getPositions();
      this.state = 'EXECUTED';
    } catch (error) {
      this.state = 'FAILED';
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
