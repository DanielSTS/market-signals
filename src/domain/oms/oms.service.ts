import EventEmitter from 'events';
import Order from './order';
import Trade from './trade';

export default abstract class OmsService {
  protected constructor(private readonly eventEmitter: EventEmitter) {}

  protected emitOrder(order: Order) {
    this.eventEmitter.emit(`onOrder.${order.exchange}.${order.symbol}`, order);
  }

  protected emitTrade(trade: Trade) {
    this.eventEmitter.emit(`onTrade.exchange.symbol`, trade);
  }

  abstract sendOrder(order: Order): Promise<Order>;
}
