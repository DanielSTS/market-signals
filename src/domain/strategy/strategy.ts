import { Candlestick } from '../market-data/candlestick';
import { OrderBook } from '../market-data/order-book';
import { Position } from './position';
import { Trade } from './trade';

export type StrategyCallbacks = {
  onBuySignal: (price: number, time: Date) => void;
  onSellSignal: (
    price: number,
    size: number,
    time: Date,
    position: Position
  ) => void;
};
export abstract class Strategy {
  private positions = new Map<string, Position>();

  protected constructor(protected readonly callbacks: StrategyCallbacks) {}

  getPositions() {
    return Array.from(this.positions.values());
  }

  openPositions() {
    return this.getPositions().filter(p => p.state === 'open');
  }

  async positionOpened(price: number, time: Date, amount: number, id: string) {
    const trade = new Trade(price, time, amount);
    const position = new Position(trade, id);
    this.positions.set(id, position);
  }

  async positionClosed(price: number, time: Date, amount: number, id: string) {
    const trade = new Trade(price, time, amount);
    const position = this.positions.get(id);
    if (position) {
      position.close(trade);
    }
  }

  abstract onCandlestick(candlesticks: Candlestick[], time: Date): void;

  abstract onOrderBook(orderBook: OrderBook): void;
}