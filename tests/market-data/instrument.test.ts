import Instrument from '../../src/domain/market-data/instrument';

describe('Instrument', () => {
  it('should create an instance of Instrument with correct properties', () => {
    const instrument = new Instrument('AAPL', 'foxbit', 1, 0.01);

    expect(instrument).toBeDefined();
    expect(instrument).toBeInstanceOf(Instrument);
    expect(instrument.symbol).toBe('AAPL');
    expect(instrument.minQuantity).toBe(1);
    expect(instrument.priceIncrement).toBe(0.01);
  });

  it('should throw an error for invalid min quantity', () => {
    expect(() => new Instrument('AAPL', 'foxbit', 0, 0.01)).toThrow(
      'Invalid min quantity'
    );
    expect(() => new Instrument('AAPL', 'foxbit', -1, 0.01)).toThrow(
      'Invalid min quantity'
    );
  });

  it('should throw an error for invalid price increment', () => {
    expect(() => new Instrument('AAPL', 'foxbit', 1, 0)).toThrow(
      'Invalid price increment'
    );
    expect(() => new Instrument('AAPL', 'foxbit', 1, -0.01)).toThrow(
      'Invalid price increment'
    );
  });
});
