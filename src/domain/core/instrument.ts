import Exchange from './exchange';

export default class Instrument {
  constructor(
    readonly symbol: string,
    readonly exchange: Exchange,
    readonly minQuantity: number,
    readonly priceIncrement: number
  ) {
    if (minQuantity <= 0) {
      throw new Error('Invalid min quantity');
    }
    if (priceIncrement <= 0) {
      throw new Error('Invalid price increment');
    }
  }
}
