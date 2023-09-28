import EventEmitter from 'events';
import { Orderbook } from '../market-data/orderbook';

export type ArbitrageParams = {
  symbolA: string;
  symbolB: string;
  exchangeA: string;
  exchangeB: string;
  spread: number;
};

export class Arbitrage {
  private orderBookA?: Orderbook;
  private orderBookB?: Orderbook;
  constructor(
    private readonly eventEmitter: EventEmitter,
    private readonly params: ArbitrageParams
  ) {
    this.eventEmitter.on(
      `onOrderBook.${params.exchangeA}.${params.symbolA}`,
      (orderBook: Orderbook) => {
        this.orderBookA = orderBook;
        this.onNewData();
      }
    );
    this.eventEmitter.on(
      `onOrderBook.${params.exchangeB}.${params.symbolB}`,
      (orderBook: Orderbook) => {
        this.orderBookB = orderBook;
        this.onNewData();
      }
    );
  }

  private onNewData() {
    if (this.orderBookA && this.orderBookB) {
      const bestBidA = this.orderBookA.bids[0][0];
      const bestAskB = this.orderBookB.asks[0][0];
      const spread = ((bestAskB - bestBidA) / bestBidA) * 100;

      if (spread >= this.params.spread) {
        this.eventEmitter.emit('arbitrageSignal', {
          spread,
          symbolA: this.params.symbolA,
          symbolB: this.params.symbolB,
          exchangeA: this.params.exchangeA,
          exchangeB: this.params.exchangeB
        });
      }
    }
  }
}
