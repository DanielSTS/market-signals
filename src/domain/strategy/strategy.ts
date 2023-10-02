import Candlestick from '../market-data/candlestick';
import OrderBook from '../market-data/order-book';
import Position from '../oms/position';
import Trade from '../oms/trade';

export type StrategyCallbacks = {
  onBuySignal: (price: number, time: Date) => void;
  onSellSignal: (
    price: number,
    quantity: number,
    time: Date,
    position: Position
  ) => void;
};
export default abstract class Strategy {
  private positions = new Map<string, Position>();

  protected constructor(protected readonly callbacks: StrategyCallbacks) {}

  getPositions() {
    return Array.from(this.positions.values());
  }

  openPosition() {
    return this.getPositions().find(position => position.state === 'OPEN');
  }

  async positionOpened(
    price: number,
    time: Date,
    quantity: number,
    id: string
  ) {
    const trade = new Trade(price, time, quantity);
    const position = new Position(trade, id);
    this.positions.set(id, position);
  }

  async positionClosed(
    price: number,
    time: Date,
    quantity: number,
    id: string
  ) {
    const trade = new Trade(price, time, quantity);
    const position = this.positions.get(id);
    if (position) {
      position.close(trade);
    }
  }

  abstract onCandlestick(candlesticks: Candlestick[]): void;

  abstract onOrderBook(orderBook: OrderBook): void;
}
