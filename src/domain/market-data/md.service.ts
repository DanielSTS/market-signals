import EventEmitter from 'events';
import { OrderBook } from './order-book';
import { SubscriptionManager } from './subscription-manager';
import { Candlestick } from './candlestick';

export abstract class MdService {
  protected subscriptionManager = new SubscriptionManager();
  protected subscriptionManagerCandlestick = new SubscriptionManager();
  private sequenceNumber = 0;
  protected constructor(private readonly eventEmitter: EventEmitter) {}

  protected processOpen(): void {
    console.log('Connection Open: Sending subscriptions...');
    this.subscriptionManager.getUniqueSubscriptions().forEach(symbol => {
      this.subscribeOrderBook(symbol);
    });
    this.subscriptionManagerCandlestick
      .getUniqueSubscriptions()
      .forEach(symbol => {
        this.subscribeCandlestick(symbol, '1h');
      });
  }

  protected emitOrderBook(orderBook: OrderBook) {
    this.eventEmitter.emit(
      `onOrderBook.${orderBook.exchange}.${orderBook.symbol}`,
      orderBook
    );
  }

  protected emitCandlestick(candlestick: Candlestick) {
    this.eventEmitter.emit(
      `onCandlestick.${candlestick.exchange}.${candlestick.symbol}`,
      candlestick
    );
  }

  protected nextSequenceNumber(): number {
    this.sequenceNumber++;
    return this.sequenceNumber;
  }

  abstract subscribeOrderBook(symbol: string): void;

  abstract unsubscribeOrderBook(symbol: string): void;

  abstract subscribeCandlestick(symbol: string, interval: string): void;

  abstract unsubscribeCandlestick(symbol: string, interval: string): void;

  abstract getCandlestick(
    symbol: string,
    interval: string,
    startTime: Date,
    endTime: Date
  ): Promise<Candlestick[]>;
}
