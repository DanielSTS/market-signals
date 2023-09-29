export type OrderSide = 'BUY' | 'SELL';
export type OrderStatus = 'NEW' | 'OPEN' | 'FILLED';
export class Order {
  status: OrderStatus = 'NEW';
  exchangeOrderId?: string;
  constructor(
    readonly exchange: string,
    readonly symbol: string,
    readonly quantity: number,
    readonly side: OrderSide,
    readonly clientOrderId: string
  ) {}
}
