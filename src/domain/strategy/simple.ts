import { Strategy, StrategyCallbacks } from './strategy';
import { Candlestick } from '../market-data/candlestick';
import { OrderBook } from '../market-data/order-book';

export class Simple extends Strategy {
  constructor(callbacks: StrategyCallbacks) {
    super(callbacks);
  }

  onCandlestick(candlesticks: Candlestick[]): void {
    const len = candlesticks.length;
    if (len < 20) {
      return;
    }

    const penultimate = candlesticks[len - 2].close;
    const last = candlesticks[len - 1].close;
    const price = last;

    const positionOpened = this.openPosition();

    if (!positionOpened) {
      if (last < penultimate) {
        this.callbacks.onBuySignal(price, new Date());
      }
    } else if (last > penultimate) {
      if (positionOpened.enterTrade.price * 1.01 < price) {
        this.callbacks.onSellSignal(
          price,
          positionOpened.enterTrade.quantity,
          new Date(),
          positionOpened
        );
      }
    }
  }

  onOrderBook(orderBook: OrderBook): void {}
}
