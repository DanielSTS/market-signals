import Runner from './runner';
import { MdService } from '../market-data/md.service';
import crypto from 'crypto';
import Timeframe from '../core/timeframe';
import Instrument from '../core/instrument';
import Position from '../oms/position';

export default class Backtest extends Runner {
  constructor(
    readonly id: string,
    private readonly startTime: Date,
    private readonly endTime: Date,
    private readonly mdService: MdService,
    timeframe: Timeframe,
    instrument: Instrument,
    strategyType: string,
    strategyParams: any
  ) {
    super(timeframe, instrument, strategyType, strategyParams);
  }
  async start() {
    try {
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
    } catch (error) {
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
