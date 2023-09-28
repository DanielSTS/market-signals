import EventEmitter from 'events';
import { Orderbook } from './orderbook';
import { SubscriptionManager } from './subscription-manager';
import { Candlestick } from './candlestick';

export abstract class MdService {
  protected subscriptionManager = new SubscriptionManager();
  private sequenceNumber = 0;
  protected constructor(private readonly eventEmitter: EventEmitter) {}

  protected processOpen(): void {
    console.log('Connection Open: Sending subscriptions...');
    this.subscriptionManager.getUniqueSubscriptions().forEach(symbol => {
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

  abstract getCandles(
    symbol: string,
    interval: string,
    startTime: Date,
    endTime: Date
  ): Promise<Candlestick[]>;
}
