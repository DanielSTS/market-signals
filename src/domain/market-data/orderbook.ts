export type OrderBookLevel = [price: number, quantity: number];

export class Orderbook {
  constructor(
    readonly symbol: string,
    readonly exchange: string,
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
