import { Provider } from '../domain/market-data/provider';
import { Orderbook, OrderBookLevel } from '../domain/market-data/orderbook';
import { ResilientWsAdapter } from './ws-adapter';
import Instrument from '../domain/market-data/instrument';

type MessageFrame = {
  m: number;
  i: number;
  n: string;
  o: string;
};
export class FoxbitProvider implements Provider {
  private ws: ResilientWsAdapter;
  private subscriptions = new Set<string>();
  private onOrderBookCallback?: (orderBook: Orderbook) => void;
  private sequenceNumber = 0;
  constructor() {
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
        case 'Level2UpdateEvent': {
          this.processLevel2UpdateEvent(payload);
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
  onOrderBook(callback: (orderBook: Orderbook) => void): void {
    this.onOrderBookCallback = callback;
  }

  subscribe(symbol: string): void {
    const payload = JSON.stringify({
      MarketId: symbol,
      Depth: 1
    });
    const messageFrame = {
      m: 2,
      i: this.nextSequenceNumber(),
      n: 'SubscribeLevel2',
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
      n: 'UnSubscribeLevel2',
      o: payload
    };
    this.ws.send(JSON.stringify(messageFrame));
    this.subscriptions.delete(symbol);
  }

  private nextSequenceNumber() {
    this.sequenceNumber++;
    return this.sequenceNumber;
  }

  private processLevel2UpdateEvent(payload: unknown): void {
    console.log(payload);
    const instrument = new Instrument('btcbrl', 'foxbit', 1, 0.001);
    const bids: OrderBookLevel[] = [
      [100, 10],
      [99, 5]
    ];
    const asks: OrderBookLevel[] = [
      [101, 8],
      [102, 3]
    ];
    const orderBook = new Orderbook(instrument, bids, asks);
    if (this.onOrderBookCallback) {
      this.onOrderBookCallback(orderBook);
    }
  }
}
