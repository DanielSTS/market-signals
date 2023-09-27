import {
  Orderbook,
  OrderBookLevel
} from '../../src/domain/market-data/orderbook';
import Instrument from '../../src/domain/market-data/instrument';

describe('Orderbook', () => {
  it('should create an instance of Orderbook', () => {
    const bids: OrderBookLevel[] = [
      [100, 10],
      [99, 5]
    ];
    const asks: OrderBookLevel[] = [
      [101, 8],
      [102, 3]
    ];

    expect(() => new Orderbook('btcbrl', 'foxbit', bids, asks)).not.toThrow();
  });

  it('should throw an error for empty order book', () => {
    const bids: OrderBookLevel[] = [];
    const asks: OrderBookLevel[] = [];

    expect(() => new Orderbook('btcbrl', 'foxbit', bids, asks)).toThrow(
      'Empty order book'
    );
  });

  it('should throw an error for invalid order book', () => {
    const bids: OrderBookLevel[] = [[103, 10]];
    const asks: OrderBookLevel[] = [[102, 5]];

    expect(() => new Orderbook('btcbrl', 'foxbit', bids, asks)).toThrow(
      'Invalid order book'
    );
  });
});
