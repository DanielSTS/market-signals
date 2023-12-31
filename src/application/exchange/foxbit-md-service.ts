import { EventEmitter } from 'ws';
import Exchange from '../../domain/core/exchange';
import Timeframe from '../../domain/core/timeframe';
import Candlestick from '../../domain/market-data/candlestick';
import MdServiceBase from '../../domain/market-data/md.service';
import OrderBook, { OrderBookLevel } from '../../domain/market-data/order-book';
import RestAdapter from '../../infra/web/rest-adapter';
import WebsocketAdapter from '../../infra/web/websocket-adapter';

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

type TickerDataUpdateEvent = [
  timestamp: string,
  open: string,
  high: string,
  low: string,
  close: string,
  volume: string
];
export default class FoxbitMdService extends MdServiceBase {
  constructor(
    eventEmitter: EventEmitter,
    private ws: WebsocketAdapter,
    private rest: RestAdapter
  ) {
    super(new Exchange('foxbit'), eventEmitter);

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
    const payload = JSON.stringify({
      MarketId: symbol
    });
    const messageFrame: MessageFrame = {
      m: 2,
      i: this.nextSequenceNumber(),
      n: 'SubscribeLevel1',
      o: payload
    };
    this.ws.send(JSON.stringify(messageFrame));
    this.subscriptionManagerOrderBook.subscribe(symbol);
  }

  unsubscribeOrderBook(symbol: string): void {
    if (!this.subscriptionManagerOrderBook.hasSubscriptions(symbol)) {
      return;
    }
    const payload = JSON.stringify({
      MarketId: symbol
    });
    const messageFrame: MessageFrame = {
      m: 2,
      i: this.nextSequenceNumber(),
      n: 'UnSubscribeLevel1',
      o: payload
    };
    this.ws.send(JSON.stringify(messageFrame));
    this.subscriptionManagerOrderBook.unsubscribe(symbol);
  }

  private processMessage(data: string): void {
    const messageFrame: MessageFrame = JSON.parse(data);
    switch (messageFrame.n) {
      case 'Level1UpdateEvent': {
        this.processLevel1UpdateEvent(
          JSON.parse(messageFrame.o) as Level1UpdateEvent
        );
        break;
      }
      case 'TickerDataUpdateEvent': {
        this.processTickerDataUpdateEvent(JSON.parse(messageFrame.o));
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
    const orderBook = new OrderBook(
      payload.MarketId,
      this.exchange,
      bids,
      asks
    );
    this.emitOrderBook(orderBook);
  }

  private processTickerDataUpdateEvent(payload: TickerDataUpdateEvent[]): void {
    const candlesticks = payload.map((candleData: TickerDataUpdateEvent) => {
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
        this.exchange,
        'btcbrl'
      );
    });

    this.emitCandlestick(candlesticks[candlesticks.length - 1]);
  }

  async getCandlestick(
    symbol: string,
    timeframe: Timeframe,
    startTime: Date,
    endTime: Date
  ): Promise<Candlestick[]> {
    const data = await this.rest.get<[]>(`markets/${symbol}/candles`, {
      interval: timeframe.value,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString()
    });
    return data.map((candleData: []) => {
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
        this.exchange,
        symbol
      );
    });
  }

  subscribeCandlestick(symbol: string, timeframe: Timeframe): void {
    const payload = JSON.stringify({
      MarketId: symbol,
      timeframe: 60
    });
    const messageFrame: MessageFrame = {
      m: 2,
      i: this.nextSequenceNumber(),
      n: 'SubscribeTicker',
      o: payload
    };
    this.ws.send(JSON.stringify(messageFrame));
    this.subscriptionManagerCandlestick.subscribe(symbol);
  }

  unsubscribeCandlestick(symbol: string, timeframe: Timeframe): void {
    if (!this.subscriptionManagerCandlestick.hasSubscriptions(symbol)) {
      return;
    }
    const payload = JSON.stringify({
      MarketId: symbol,
      timeframe: 60
    });
    const messageFrame: MessageFrame = {
      m: 2,
      i: this.nextSequenceNumber(),
      n: 'UnSubscribeTicker',
      o: payload
    };
    this.ws.send(JSON.stringify(messageFrame));
    this.subscriptionManagerCandlestick.unsubscribe(symbol);
  }
}
