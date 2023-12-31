import Timeframe from '../core/timeframe';
import Candlestick from './candlestick';
import { MdService } from './md.service';
import EventEmitter from 'events';

export default class CandlestickManager {
  private historicalCandles: Candlestick[] = [];
  private subscribers: ((candlesticks: Candlestick[]) => void)[] = [];

  constructor(
    private readonly eventEmitter: EventEmitter,
    private readonly mdService: MdService
  ) {}

  private onCandlestick(candle: Candlestick) {
    if (this.historicalCandles.length === 0) return;

    const lastHistoricalCandle =
      this.historicalCandles[this.historicalCandles.length - 1];

    if (candle.timestamp <= lastHistoricalCandle.timestamp) {
      console.log(
        'Real-time candlestick is either not the most recent or is a duplicate.'
      );
      return;
    }

    this.historicalCandles.push(candle);

    this.notifySubscribers(this.historicalCandles);
  }

  subscribe(callback: (candlesticks: Candlestick[]) => void) {
    this.subscribers.push(callback);
    this.mdService
      .getCandlestick(
        'btcbrl',
        new Timeframe('1h'),
        new Date('2022-07-18T00:00'),
        new Date('2022-08-19T12:00')
      )
      .then(candlesticks => {
        this.historicalCandles = [...candlesticks];
        this.notifySubscribers(this.historicalCandles);
      })
      .then(() =>
        this.mdService.subscribeCandlestick('btcbrl', { value: '1h' })
      )
      .then(() => {
        this.eventEmitter.on(
          'onCandlestick.binance.btcbrl',
          this.onCandlestick.bind(this)
        );
      });
  }

  private notifySubscribers(candlesticks: Candlestick[]) {
    this.subscribers.forEach(callback => {
      callback(candlesticks);
    });
  }
}
