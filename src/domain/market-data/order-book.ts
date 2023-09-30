import Exchange from '../core/exchange';

export type OrderBookLevel = [price: number, quantity: number];

export class OrderBook {
  constructor(
    readonly symbol: string,
    readonly exchange: Exchange,
    readonly bids: OrderBookLevel[],
    readonly asks: OrderBookLevel[]
  ) {
    if (!bids.length || !asks.length) {
      throw new Error('Empty order book');
    }
    if (bids[0][0] > asks[0][0]) {
      throw new Error('Invalid order book');
    }
  }
}
