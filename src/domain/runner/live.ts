import { Runner } from './runner';
import { Position } from '../core/position';
import crypto from 'node:crypto';
import { CandlestickManager } from '../market-data/candle-manager';

export class Live extends Runner {
  constructor(
    private readonly candlestickManager: CandlestickManager,
    interval: string,
    symbol: string,
    strategyType: string,
    strategyParams: any
  ) {
    super(interval, symbol, strategyType, strategyParams);
  }
  async start() {
    try {
      this.candlestickManager.subscribe(this.strategy.onCandlestick);
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
