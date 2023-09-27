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
  private subscriptions = new Set<string>();
  private sequenceNumber = 0;

  constructor(
    readonly eventEmitter: EventEmitter,
    private ws: WsAdapter
  ) {
    super(eventEmitter);

    this.ws.onOpen(() => {
      console.log('Connection Open: Sending subscriptions...');
      this.subscriptions.forEach(symbol => {
        this.subscribe(symbol);
      });
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
    this.subscriptions.add(symbol);
  }

  unsubscribe(symbol: string): void {
    const stream = `${symbol.toLowerCase()}@bookTicker`;
    const messageFrame = {
      method: 'UNSUBSCRIBE',
      params: [stream],
      id: this.nextSequenceNumber()
    };
    this.ws.send(JSON.stringify(messageFrame));
    this.subscriptions.delete(symbol);
  }

  private nextSequenceNumber(): number {
    this.sequenceNumber++;
    return this.sequenceNumber;
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
