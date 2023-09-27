import { Orderbook } from './orderbook';

export interface Provider {
  subscribe(symbol: string): void;
  unsubscribe(symbol: string): void;
  onOrderBook(callback: (orderBook: Orderbook) => void): void;
}
