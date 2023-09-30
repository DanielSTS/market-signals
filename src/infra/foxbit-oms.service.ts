import OmsService from '../domain/oms/oms.service';
import Order from '../domain/core/order';
import RestAdapter from './rest-adapter';
import EventEmitter from 'events';

type OrderResponse = {
  id: string;
};

export default class FoxbitOmsService extends OmsService {
  constructor(
    private readonly rest: RestAdapter,
    eventEmitter: EventEmitter
  ) {
    super(eventEmitter);
  }
  async sendOrder(order: Order): Promise<Order> {
    const data = {
      side: order.side,
      type: 'MARKET',
      market_symbol: order.symbol,
      client_order_id: order.clientOrderId,
      quantity: order.quantity.toString()
    };
    const ret = await this.rest.post<OrderResponse>('order', data);
    return { ...order, status: 'OPEN', exchangeOrderId: ret.id };
  }
}
