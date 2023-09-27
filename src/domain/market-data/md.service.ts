import EventEmitter from 'events';
import { Orderbook } from './orderbook';
import { SubscriptionManager } from './subscription-manager';

export abstract class MdService {
  protected subscriptions = new SubscriptionManager();
  private sequenceNumber = 0;
  protected constructor(readonly eventEmitter: EventEmitter) {}

  protected processOpen(): void {
    console.log('Connection Open: Sending subscriptions...');
    this.subscriptions.getUniqueSubscriptions().forEach(symbol => {
      this.subscribe(symbol);
    });
  }

  protected emitOrderBook(orderBook: Orderbook) {
    this.eventEmitter.emit(
      `onOrderBook.${orderBook.exchange}.${orderBook.symbol}`,
      orderBook
    );
  }

  protected nextSequenceNumber(): number {
    this.sequenceNumber++;
    return this.sequenceNumber;
  }

  abstract subscribe(symbol: string): void;

  abstract unsubscribe(symbol: string): void;
}
