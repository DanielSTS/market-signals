export const SupportedExchanges = ['foxbit', 'binance'];

export default class Exchange {
  readonly value: string;
  constructor(value: string) {
    const valueFormatted = value.toLowerCase();
    if (!SupportedExchanges.includes(valueFormatted)) {
      throw new Error('Invalid exchange');
    }
    this.value = valueFormatted;
  }
}
