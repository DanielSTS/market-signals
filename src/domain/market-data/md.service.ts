import EventEmitter from 'events';
import OrderBook from './order-book';
import SubscriptionManager from '../core/subscription-manager';
import Candlestick from './candlestick';
import Timeframe from '../core/timeframe';
import Exchange from '../core/exchange';

export interface MdService {
  subscribeOrderBook(symbol: string): void;

  unsubscribeOrderBook(symbol: string): void;

  subscribeCandlestick(symbol: string, timeframe: Timeframe): void;

  unsubscribeCandlestick(symbol: string, timeframe: Timeframe): void;
  getCandlestick(
    symbol: string,
    timeframe: Timeframe,
    startTime: Date,
    endTime: Date
  ): Promise<Candlestick[]>;
}

export default abstract class MdServiceBase implements MdService {
  protected subscriptionManagerOrderBook = new SubscriptionManager();
  protected subscriptionManagerCandlestick = new SubscriptionManager();
  private sequenceNumber = 0;
  protected constructor(
    protected readonly exchange: Exchange,
    private readonly eventEmitter: EventEmitter
  ) {}

  protected processOpen(): void {
    this.subscriptionManagerOrderBook
      .getUniqueSubscriptions()
      .forEach(symbol => {
        this.subscribeOrderBook(symbol);
      });
    this.subscriptionManagerCandlestick
      .getUniqueSubscriptions()
      .forEach(symbol => {
        this.subscribeCandlestick(symbol, new Timeframe('1h'));
      });
  }

  protected emitOrderBook(orderBook: OrderBook) {
    this.eventEmitter.emit(
      `onOrderBook.${orderBook.exchange.value}.${orderBook.symbol}`,
      orderBook
    );
  }

  protected emitCandlestick(candlestick: Candlestick) {
    this.eventEmitter.emit(
      `onCandlestick.${candlestick.exchange.value}.${candlestick.symbol}`,
      candlestick
    );
  }

  protected nextSequenceNumber(): number {
    this.sequenceNumber++;
    return this.sequenceNumber;
  }

  abstract subscribeOrderBook(symbol: string): void;

  abstract unsubscribeOrderBook(symbol: string): void;

  abstract subscribeCandlestick(symbol: string, timeframe: Timeframe): void;

  abstract unsubscribeCandlestick(symbol: string, timeframe: Timeframe): void;

  abstract getCandlestick(
    symbol: string,
    timeframe: Timeframe,
    startTime: Date,
    endTime: Date
  ): Promise<Candlestick[]>;
}
