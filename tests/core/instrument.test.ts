import Exchange from '../../src/domain/core/exchange';
import Instrument from '../../src/domain/core/instrument';

describe('Instrument', () => {
  const exchange = new Exchange('foxbit');
  it('should create an instance of Instrument with correct properties', () => {
    const instrument = new Instrument('btcbrl', exchange, 1, 0.01);

    expect(instrument).toBeDefined();
    expect(instrument).toBeInstanceOf(Instrument);
    expect(instrument.symbol).toBe('btcbrl');
    expect(instrument.exchange).toBe(exchange);
    expect(instrument.minQuantity).toBe(1);
    expect(instrument.priceIncrement).toBe(0.01);
  });

  it('should throw an error for invalid min quantity', () => {
    expect(() => new Instrument('btcbrl', exchange, 0, 0.01)).toThrow(
      'Invalid min quantity'
    );
    expect(() => new Instrument('btcbrl', exchange, -1, 0.01)).toThrow(
      'Invalid min quantity'
    );
  });

  it('should throw an error for invalid price increment', () => {
    expect(() => new Instrument('btcbrl', exchange, 1, 0)).toThrow(
      'Invalid price increment'
    );
    expect(() => new Instrument('btcbrl', exchange, 1, -0.01)).toThrow(
      'Invalid price increment'
    );
  });
});
