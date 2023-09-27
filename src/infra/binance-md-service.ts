import { Orderbook, OrderBookLevel } from '../domain/market-data/orderbook';
import { MdService } from '../domain/market-data/md.service';
import EventEmitter from 'events';
import { WsAdapter } from './websocket';

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
    readonly eventEmitter: EventEmitter,
    private ws: WsAdapter
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
    this.subscriptions.subscribe(symbol);
  }

  unsubscribe(symbol: string): void {
    if (!this.subscriptions.hasSubscriptions(symbol)) {
      return;
    }
    const stream = `${symbol.toLowerCase()}@bookTicker`;
    const messageFrame = {
      method: 'UNSUBSCRIBE',
      params: [stream],
      id: this.nextSequenceNumber()
    };
    this.ws.send(JSON.stringify(messageFrame));
    this.subscriptions.unsubscribe(symbol);
  }

  private processMessage(data: string) {
    console.log('Message received', data);
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
}
