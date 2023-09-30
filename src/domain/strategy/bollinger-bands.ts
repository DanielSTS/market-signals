import Candlestick from '../market-data/candlestick';
import OrderBook from '../market-data/order-book';
import Strategy, { StrategyCallbacks } from './strategy';

export default class BollingerBands extends Strategy {
  constructor(
    private readonly period: number,
    private readonly deviation: number,
    callbacks: StrategyCallbacks
  ) {
    super(callbacks);
  }

  onCandlestick(candlesticks: Candlestick[]): void {
    if (candlesticks.length < this.period) {
      return;
    }

    const closePrices = candlesticks.map(c => c.close);
    const currentPrice = closePrices[closePrices.length - 1];

    const sma = this.calculateSMA(closePrices);
    const stdDev = this.calculateStandardDeviation(sma, closePrices);

    const lowerBand = sma - this.deviation * stdDev;

    const positionOpened = this.openPosition();

    if (!positionOpened && currentPrice < lowerBand) {
      this.callbacks.onBuySignal(currentPrice, new Date());
    }

    if (positionOpened && currentPrice > sma) {
      this.callbacks.onSellSignal(
        currentPrice,
        positionOpened.enterTrade.quantity,
        new Date(),
        positionOpened
      );
    }
  }

  private calculateSMA(prices: number[]): number {
    const sum = prices.reduce((total, price) => total + price, 0);
    return sum / prices.length;
  }

  private calculateStandardDeviation(sma: number, prices: number[]): number {
    const diffSquaredSum = prices.reduce(
      (sum, price) => sum + Math.pow(price - sma, 2),
      0
    );
    const variance = diffSquaredSum / prices.length;
    return Math.sqrt(variance);
  }

  onOrderBook(orderBook: OrderBook): void {
    throw new Error('Method not implemented.');
  }
}
