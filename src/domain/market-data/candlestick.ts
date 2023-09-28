export class Candlestick {
  constructor(
    public timestamp: Date,
    public open: number,
    public high: number,
    public low: number,
    public close: number,
    public volume: number
  ) {}
}
