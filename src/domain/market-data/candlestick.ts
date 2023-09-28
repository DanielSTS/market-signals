export class Candlestick {
  constructor(
    readonly timestamp: Date,
    readonly open: number,
    readonly high: number,
    readonly low: number,
    readonly close: number,
    readonly volume: number,
    readonly exchange: string,
    readonly symbol: string
  ) {}
}
