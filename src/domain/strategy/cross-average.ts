import { CandlestickManager } from '../market-data/candle-manager';
import { Strategy } from './strategy';
import { Candlestick } from '../market-data/candlestick';

export class CrossAverage implements Strategy {
  constructor(private readonly candlestickManager: CandlestickManager) {
    this.candlestickManager.subscribe(this.onCandlestick);
  }

  onCandlestick(candlesticks: Candlestick[]): void {
    console.log('new candlesticks', candlesticks);
  }
}
