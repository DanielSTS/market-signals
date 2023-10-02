import Trade from '../../src/domain/oms/trade';

describe('Trade', () => {
  it('should create a Trade instance with valid price and quantity', () => {
    const validPrice = 10.5;
    const validTime = new Date();
    const validQuantity = 100;

    const trade = new Trade(validPrice, validTime, validQuantity);

    expect(trade.price).toBe(validPrice);
    expect(trade.time).toBe(validTime);
    expect(trade.quantity).toBe(validQuantity);
  });

  it('should throw an error when creating a Trade instance with an invalid price', () => {
    const invalidPrice = 0;
    const validTime = new Date();
    const validQuantity = 100;

    expect(() => new Trade(invalidPrice, validTime, validQuantity)).toThrow(
      'Invalid price'
    );
  });

  it('should throw an error when creating a Trade instance with an invalid quantity', () => {
    const validPrice = 10.5;
    const validTime = new Date();
    const invalidQuantity = 0;

    expect(() => new Trade(validPrice, validTime, invalidQuantity)).toThrow(
      'Invalid quantity'
    );
  });
});
