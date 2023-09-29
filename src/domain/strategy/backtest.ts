import { Runner } from './runner';
import { Position } from './position';
import { MdService } from '../market-data/md.service';
import crypto from 'node:crypto';

export class BackTester extends Runner {
  constructor(
    private readonly mdService: MdService,
    startTime: Date,
    endTime: Date,
    interval: string,
    symbol: string,
    strategyType: string,
    strategyParams: any
  ) {
    super(startTime, endTime, interval, symbol, strategyType, strategyParams);
  }
  async start() {
    try {
      const history = await this.mdService.getCandlestick(
        this.symbol,
        this.interval,
        this.startTime,
        this.endTime
      );

      await Promise.all(
        history.map((candlestick, index) => {
          const candlesticks = history.slice(0, index + 1);
          return this.strategy.onCandlestick(
            candlesticks,
            candlestick.timestamp
          );
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
