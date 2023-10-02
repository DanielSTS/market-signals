import Exchange from '../../src/domain/core/exchange';

describe('Exchange', () => {
  it('should create an Exchange instance with a valid exchange value', () => {
    const validExchange = 'foxbit';
    const exchange = new Exchange(validExchange);
    expect(exchange.value).toBe(validExchange);
  });

  it('should throw an error when creating an Exchange instance with an invalid exchange value', () => {
    const invalidExchange = 'invalid-exchange';
    expect(() => new Exchange(invalidExchange)).toThrow('Invalid exchange');
  });
});
