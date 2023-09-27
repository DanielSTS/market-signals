import EventEmitter from 'events';
import { Orderbook } from './orderbook';

export abstract class MdService {
  protected constructor(readonly eventEmitter: EventEmitter) {}

  protected emitOrderBook(orderBook: Orderbook) {
    this.eventEmitter.emit(
      `onOrderBook.${orderBook.exchange}.${orderBook.symbol}`,
      orderBook
    );
  }
  abstract subscribe(symbol: string): void;

  abstract unsubscribe(symbol: string): void;
}
