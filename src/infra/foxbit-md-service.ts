import { Orderbook, OrderBookLevel } from '../domain/market-data/orderbook';
import { MdService } from '../domain/market-data/md.service';
import EventEmitter from 'events';
import { WsAdapter } from './websocket';

type MessageFrame = {
  m: number;
  i: number;
  n: string;
  o: string;
};

type Level1UpdateEvent = {
  MarketId: string;
  BestBid: number;
  BestOffer: number;
};
export class FoxbitMdService extends MdService {
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
    const payload = JSON.stringify({
      MarketId: symbol
    });
    const messageFrame = {
      m: 2,
      i: this.nextSequenceNumber(),
      n: 'SubscribeLevel1',
      o: payload
    };
    this.ws.send(JSON.stringify(messageFrame));
    this.subscriptions.subscribe(symbol);
  }

  unsubscribe(symbol: string): void {
    if (!this.subscriptions.hasSubscriptions(symbol)) {
      return;
    }
    const payload = JSON.stringify({
      MarketId: symbol
    });
    const messageFrame = {
      m: 2,
      i: this.nextSequenceNumber(),
      n: 'UnSubscribeLevel1',
      o: payload
    };
    this.ws.send(JSON.stringify(messageFrame));
    this.subscriptions.unsubscribe(symbol);
  }

  private processMessage(data: string): void {
    console.log('Message received', data);
    const messageFrame: MessageFrame = JSON.parse(data);
    switch (messageFrame.n) {
      case 'Level1UpdateEvent': {
        this.processLevel1UpdateEvent(
          JSON.parse(messageFrame.o) as Level1UpdateEvent
        );
        break;
      }
      default: {
        break;
      }
    }
  }

  private processLevel1UpdateEvent(payload: Level1UpdateEvent): void {
    const bids: OrderBookLevel[] = [[payload.BestBid, Number.MAX_SAFE_INTEGER]];
    const asks: OrderBookLevel[] = [
      [payload.BestOffer, Number.MAX_SAFE_INTEGER]
    ];
    const orderBook = new Orderbook(payload.MarketId, 'foxbit', bids, asks);
    this.emitOrderBook(orderBook);
  }
}
