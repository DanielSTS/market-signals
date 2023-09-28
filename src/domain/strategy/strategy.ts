import { Candlestick } from '../market-data/candlestick';

export abstract class Strategy {
  abstract onCandlestick: (candlesticks: Candlestick[]) => void;
}
