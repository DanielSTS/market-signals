import Exchange from '../core/exchange';

export type OrderSide = 'BUY' | 'SELL';
export type OrderStatus = 'NEW' | 'OPEN' | 'FILLED';

export default class Order {
  private status: OrderStatus = 'NEW';
  readonly exchangeOrderId?: string;
  constructor(
    readonly exchange: Exchange,
    readonly symbol: string,
    readonly quantity: number,
    readonly side: OrderSide,
    readonly clientOrderId: string
  ) {
    if (this.quantity <= 0) throw new Error('Invalid quantity');
  }
  getStatus(): OrderStatus {
    return this.status;
  }
  updateStatus(status: OrderStatus): void {
    this.status = status;
  }
}
