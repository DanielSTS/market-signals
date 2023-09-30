export const SupportedTimeframes = [
  '1m',
  '5m',
  '15m',
  '30m',
  '1h',
  '2h',
  '4h',
  '6h',
  '8h'
];

export default class Timeframe {
  readonly value: string;
  constructor(value: string) {
    if (!SupportedTimeframes.includes(value)) {
      throw new Error('Invalid timeframe');
    }
    this.value = value;
  }
}
