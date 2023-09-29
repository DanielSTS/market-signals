import { Candlestick } from '../market-data/candlestick';
import { OrderBook } from '../market-data/order-book';
import { Strategy, StrategyCallbacks } from './strategy';

export type ArbitrageParams = {
  symbolA: string;
  symbolB: string;
  exchangeA: string;
  exchangeB: string;
  spread: number;
};

export class Arbitrage extends Strategy {
  private orderBookA?: OrderBook;
  private orderBookB?: OrderBook;

  constructor(
    private readonly params: ArbitrageParams,
    callbacks: StrategyCallbacks
  ) {
    super(callbacks);
  }

  onCandlestick(candlesticks: Candlestick[]) {}

  onOrderBook(orderBook: OrderBook): void {
    if (orderBook.exchange === this.orderBookA?.exchange) {
      this.orderBookA = orderBook;
    } else if (orderBook.exchange === this.orderBookB?.exchange) {
      this.orderBookB = orderBook;
    }
    this.onNewData();
  }

  private onNewData() {
    if (this.orderBookA && this.orderBookB) {
      const bestBidA = this.orderBookA.bids[0][0];
      const bestAskB = this.orderBookB.asks[0][0];
      const spread = ((bestAskB - bestBidA) / bestBidA) * 100;

      if (spread >= this.params.spread) {
        /*        this.eventEmitter.emit('arbitrageSignal', {
          spread,
          symbolA: this.params.symbolA,
          symbolB: this.params.symbolB,
          exchangeA: this.params.exchangeA,
          exchangeB: this.params.exchangeB
        });*/
      }
    }
  }
}
