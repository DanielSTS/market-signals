export const SupportedExchanges = ['foxbit', 'binance'];

export default class Exchange {
  readonly value: string;
  constructor(value: string) {
    if (!SupportedExchanges.includes(value)) {
      throw new Error('Invalid exchange');
    }
    this.value = value;
  }
}
