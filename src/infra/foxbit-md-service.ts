import { Orderbook, OrderBookLevel } from '../domain/market-data/orderbook';
import { ResilientWsAdapter } from './ws-adapter';
import { MdService } from '../domain/market-data/md.service';
import EventEmitter from 'events';

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
  private ws: ResilientWsAdapter;
  private subscriptions = new Set<string>();
  private sequenceNumber = 0;
  constructor(readonly eventEmitter: EventEmitter) {
    super(eventEmitter);

    this.ws = new ResilientWsAdapter('wss://api.foxbit.com.br/');

    this.ws.onOpen(() => {
      console.log('Conexão WebSocket aberta. Enviando inscrições...');
      this.subscriptions.forEach(symbol => {
        this.subscribe(symbol);
      });
    });

    this.ws.onMessage(data => {
      console.log('Mensagem recebida', data);
      const messageFrame: MessageFrame = JSON.parse(data);
      const payload = JSON.parse(messageFrame.o);
      switch (messageFrame.n) {
        case 'Level1UpdateEvent': {
          this.processLevel1UpdateEvent(payload as Level1UpdateEvent);
          break;
        }
        default: {
          break;
        }
      }
    });

    this.ws.onError(error => {
      console.log('Error recebido', error);
    });

    this.ws.onClose((code, reason) => {
      console.log('Close recebido', { code, reason });
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
    this.subscriptions.add(symbol);
  }

  unsubscribe(symbol: string): void {
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
    this.subscriptions.delete(symbol);
  }

  private nextSequenceNumber() {
    this.sequenceNumber++;
    return this.sequenceNumber;
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
