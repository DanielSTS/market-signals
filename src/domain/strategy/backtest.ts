import { Runner } from './runner';
import { Position } from './position';
import { MdService } from '../market-data/md.service';
import crypto from 'node:crypto';

export class Backtester extends Runner {
  constructor(
    private readonly mdService: MdService,
    start: Date,
    end: Date,
    interval: string,
    symbol: string,
    strategyType: string,
    strategyParams: any
  ) {
    super(start, end, interval, symbol, strategyType, strategyParams);
  }
  async startBacktester() {
    try {
      const history = await this.mdService.getCandlestick(
        this.symbol,
        this.interval,
        this.start,
        this.end
      );

      await Promise.all(
        history.map((stick, index) => {
          const sticks = history.slice(0, index + 1);
          return this.strategy.onCandlestick(sticks, stick.timestamp);
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
    this.strategy.positionOpened(price, time, 1.0, id);
  }

  onSellSignal(price: number, size: number, time: Date, position: Position) {
    this.strategy.positionClosed(price, time, size, position.id);
  }
}
