import { Orderbook, OrderBookLevel } from '../domain/market-data/orderbook';
import { MdService } from '../domain/market-data/md.service';
import EventEmitter from 'events';
import { WebsocketAdapter } from './websocket-adapter';
import { Candlestick } from '../domain/market-data/candlestick';
import { RestAdapter } from './rest-adapter';

type MessageFrame = {
  u: number; // Order book updateId
  s: string; // Symbol
  b: string; // Best bid price
  B: string; // Best bid quantity
  a: string; // Best ask price
  A: string; // Best ask quantity
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

  subscribe(symbol: string): void {
    const stream = `${symbol.toLowerCase()}@bookTicker`;
    const messageFrame = {
      method: 'SUBSCRIBE',
      params: [stream],
      id: this.nextSequenceNumber()
    };
    this.ws.send(JSON.stringify(messageFrame));
    this.subscriptionManager.subscribe(symbol);
  }

  unsubscribe(symbol: string): void {
    if (!this.subscriptionManager.hasSubscriptions(symbol)) {
      return;
    }
    const stream = `${symbol.toLowerCase()}@bookTicker`;
    const messageFrame = {
      method: 'UNSUBSCRIBE',
      params: [stream],
      id: this.nextSequenceNumber()
    };
    this.ws.send(JSON.stringify(messageFrame));
    this.subscriptionManager.unsubscribe(symbol);
  }

  private processMessage(data: string) {
    const messageFrame: MessageFrame = JSON.parse(data);
    if (messageFrame.s) {
      this.processDepthUpdateEvent(messageFrame);
    }
  }

  private processDepthUpdateEvent(payload: MessageFrame): void {
    const symbol = payload.s.toLowerCase();
    const bids: OrderBookLevel[] = [
      [parseFloat(payload.b), parseFloat(payload.B)]
    ];
    const asks: OrderBookLevel[] = [
      [parseFloat(payload.a), parseFloat(payload.A)]
    ];

    const orderBook = new Orderbook(symbol, 'binance', bids, asks);
    this.emitOrderBook(orderBook);
  }

  async getCandles(
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
      return new Candlestick(timestampDate, open, high, low, close, volume);
    });
  }
}
