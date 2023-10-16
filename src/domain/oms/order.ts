import Exchange from '../core/exchange';

export type OrderSide = 'BUY' | 'SELL';
export type OrderStatus = 'NEW' | 'OPEN' | 'FILLED';

export default class Order {
  private _status: OrderStatus = 'NEW';
  private _exchangeOrderId?: string;
  constructor(
    readonly exchange: Exchange,
    readonly symbol: string,
    readonly quantity: number,
    readonly side: OrderSide,
    readonly clientOrderId: string
  ) {
    if (this.quantity <= 0) throw new Error('Invalid quantity');
  }
  status(): OrderStatus {
    return this._status;
  }
  updateStatus(status: OrderStatus): void {
    this._status = status;
  }

  setExchangeOrderId(exchangeOrderId: string): void {
    if (this._exchangeOrderId)
      throw new Error('Order already has an exchange order id');
    this._exchangeOrderId = exchangeOrderId;
  }
}
