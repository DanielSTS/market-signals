import { Provider } from './provider';
import EventEmitter from 'events';
import { Orderbook } from './orderbook';

export class MdService {
  constructor(
    readonly provider: Provider,
    readonly eventEmitter: EventEmitter
  ) {
    this.provider.onOrderBook((orderBook: Orderbook) => {
      this.eventEmitter.emit(
        `onOrderBook.${orderBook.exchange}.${orderBook.symbol}`,
        orderBook
      );
    });
  }

  subscribe(symbol: string): void {
    this.provider.subscribe(symbol);
  }
  unsubscribe(symbol: string): void {
    this.provider.unsubscribe(symbol);
  }
}
