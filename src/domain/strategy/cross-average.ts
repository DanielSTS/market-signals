import { Strategy, StrategyCallbacks } from './strategy';
import { Candlestick } from '../market-data/candlestick';
import { OrderBook } from '../market-data/order-book';

export class CrossAverage extends Strategy {
  constructor(callbacks: StrategyCallbacks) {
    super(callbacks);
  }

  onCandlestick(candlesticks: Candlestick[], time: Date): void {
    const len = candlesticks.length;
    if (len < 20) {
      return;
    }

    const penu = candlesticks[len - 2].close;
    const last = candlesticks[len - 1].close;
    const price = last;

    const open = this.openPositions();

    if (open.length == 0) {
      if (last < penu) {
        this.callbacks.onBuySignal(price, time);
      }
    } else if (last > penu) {
      open.forEach(p => {
        if (p.enter.price * 1.01 < price) {
          this.callbacks.onSellSignal(price, p.enter.size, time, p);
        }
      });
    }
  }

  onOrderBook(orderBook: OrderBook): void {}
}
