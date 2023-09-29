import { OrderBook, OrderBookLevel } from '../domain/market-data/order-book';
import { MdService } from '../domain/market-data/md.service';
import EventEmitter from 'events';
import { WebsocketAdapter } from './websocket-adapter';
import { Candlestick } from '../domain/market-data/candlestick';
import { RestAdapter } from './rest-adapter';

type BookTickerEvent = {
  u: number; // Order book updateId
  s: string; // Symbol
  b: string; // Best bid price
  B: string; // Best bid quantity
  a: string; // Best ask price
  A: string; // Best ask quantity
};

type KlineEvent = {
  e: 'kline'; // Event type
  E: number; // Event time
  s: string; // Symbol
  k: {
    t: number; // Kline start time
    T: number; // Kline close time
    s: string; // Symbol
    i: string; // Interval
    f: number; // First trade ID
    L: number; // Last trade ID
    o: string; // Open price
    c: string; // Close price
    h: string; // High price
    l: string; // Low price
    v: string; // Base asset volume
    n: number; // Number of trades
    x: boolean; // Is this kline closed?
    q: string; // Quote asset volume
    V: string; // Taker buy base asset volume
    Q: string; // Taker buy quote asset volume
    B: string; // Ignore
  };
};

export class BinanceMdService extends MdService {
  constructor(
    eventEmitter: EventEmitter,
    private ws: WebsocketAdapter,
    private rest: RestAdapter
  ) {
    super(eventEmitter);

    this.ws.onOpen(() => {
      this.processOpen();
    });

    this.ws.onMessage(data => {
      this.processMessage(data);
    });

    this.ws.onError(error => {
      console.log('Error received', error);
    });

    this.ws.onClose((code, reason) => {
      console.log('Close received', { code, reason });
    });

    this.ws.open();
  }

  subscribeOrderBook(symbol: string): void {
    const stream = `${symbol.toLowerCase()}@bookTicker`;
    const messageFrame = {
      method: 'SUBSCRIBE',
      params: [stream],
      id: this.nextSequenceNumber()
    };
    this.ws.send(JSON.stringify(messageFrame));
    this.subscriptionManagerOrderBook.subscribe(symbol);
  }

  unsubscribeOrderBook(symbol: string): void {
    if (!this.subscriptionManagerOrderBook.hasSubscriptions(symbol)) {
      return;
    }
    const stream = `${symbol.toLowerCase()}@bookTicker`;
    const messageFrame = {
      method: 'UNSUBSCRIBE',
      params: [stream],
      id: this.nextSequenceNumber()
    };
    this.ws.send(JSON.stringify(messageFrame));
    this.subscriptionManagerOrderBook.unsubscribe(symbol);
  }

  private processMessage(data: string) {
    const messageFrame = JSON.parse(data);
    if (messageFrame.e === 'kline') {
      this.processKlineEvent(messageFrame);
    } else if (messageFrame.s) {
      this.processBookTickerEvent(messageFrame);
    }
  }

  private processBookTickerEvent(payload: BookTickerEvent): void {
    const symbol = payload.s.toLowerCase();
    const bids: OrderBookLevel[] = [
      [parseFloat(payload.b), parseFloat(payload.B)]
    ];
    const asks: OrderBookLevel[] = [
      [parseFloat(payload.a), parseFloat(payload.A)]
    ];

    const orderBook = new OrderBook(symbol, 'binance', bids, asks);
    this.emitOrderBook(orderBook);
  }

  private processKlineEvent(payload: KlineEvent): void {
    const {
      t: timestamp,
      o: open,
      h: high,
      l: low,
      c: close,
      v: volume,
      s: symbol
    } = payload.k;
    const candlestick = new Candlestick(
      new Date(timestamp),
      parseFloat(open),
      parseFloat(high),
      parseFloat(low),
      parseFloat(close),
      parseFloat(volume),
      'binance',
      symbol.toLowerCase()
    );
    this.emitCandlestick(candlestick);
  }

  async getCandlestick(
    symbol: string,
    interval: string,
    startTime: Date,
    endTime: Date
  ): Promise<Candlestick[]> {
    const startTimeMillis = startTime.getTime();
    const endTimeMillis = endTime.getTime();
    const response = await this.rest.get<[]>(`klines`, {
      symbol: symbol.toUpperCase(),
      interval: interval,
      startTime: startTimeMillis,
      endTime: endTimeMillis
    });
    return response.map((candleData: []) => {
      const [timestamp, open, high, low, close, volume] = candleData.map(
        (value: string) => parseFloat(value)
      );
      const timestampDate = new Date(timestamp);
      return new Candlestick(
        timestampDate,
        open,
        high,
        low,
        close,
        volume,
        'binance',
        symbol
      );
    });
  }

  subscribeCandlestick(symbol: string, interval: string): void {
    const stream = `${symbol.toLowerCase()}@kline_1h`;
    const messageFrame = {
      method: 'SUBSCRIBE',
      params: [stream],
      id: this.nextSequenceNumber()
    };
    this.ws.send(JSON.stringify(messageFrame));
    this.subscriptionManagerCandlestick.subscribe(symbol);
  }

  unsubscribeCandlestick(symbol: string, interval: string): void {}
}
