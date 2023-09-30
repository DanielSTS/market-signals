export class Trade {
  constructor(
    readonly price: number,
    readonly time: Date,
    readonly quantity: number
  ) {
    if (price <= 0) {
      throw new Error('Invalid price');
    }
    if (quantity <= 0) {
      throw new Error('Invalid quantity');
    }
  }
}
