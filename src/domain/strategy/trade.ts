export class Trade {
  constructor(
    readonly price: number,
    readonly time: Date,
    readonly size: number
  ) {}
}
