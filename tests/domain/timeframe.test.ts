import Timeframe from '../../src/domain/core/timeframe';

describe('Timeframe', () => {
  it('should create a Timeframe instance with a valid timeframe value', () => {
    const validTimeframe = '1h';
    const timeframe = new Timeframe(validTimeframe);
    expect(timeframe.value).toBe(validTimeframe);
  });

  it('should throw an error when creating a Timeframe instance with an invalid timeframe value', () => {
    const invalidTimeframe = 'invalid-timeframe';
    expect(() => new Timeframe(invalidTimeframe)).toThrow('Invalid timeframe');
  });
});
