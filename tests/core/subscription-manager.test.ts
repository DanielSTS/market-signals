import { SubscriptionManager } from '../../src/domain/core/subscription-manager';

describe('SubscriptionManager', () => {
  let subscriptionManager: SubscriptionManager;

  beforeEach(() => {
    subscriptionManager = new SubscriptionManager();
  });

  it('should subscribe to a symbol', () => {
    const symbol = 'btc';
    subscriptionManager.subscribe(symbol);
    expect(subscriptionManager.hasSubscriptions(symbol)).toBe(true);
  });

  it('should unsubscribe from a symbol', () => {
    const symbol = 'eth';
    subscriptionManager.subscribe(symbol);
    subscriptionManager.unsubscribe(symbol);
    expect(subscriptionManager.hasSubscriptions(symbol)).toBe(false);
  });

  it('should handle multiple subscriptions and unsubscriptions', () => {
    const symbol1 = 'btc';
    const symbol2 = 'eth';

    subscriptionManager.subscribe(symbol1);
    subscriptionManager.subscribe(symbol1);
    subscriptionManager.subscribe(symbol2);
    subscriptionManager.unsubscribe(symbol1);

    expect(subscriptionManager.hasSubscriptions(symbol1)).toBe(true);
    expect(subscriptionManager.hasSubscriptions(symbol2)).toBe(true);

    subscriptionManager.unsubscribe(symbol1);
    subscriptionManager.unsubscribe(symbol1);
    expect(subscriptionManager.hasSubscriptions(symbol1)).toBe(false);
  });

  it('should get unique subscriptions', () => {
    const symbol1 = 'btc';
    const symbol2 = 'eth';

    subscriptionManager.subscribe(symbol1);
    subscriptionManager.subscribe(symbol1);
    subscriptionManager.subscribe(symbol2);

    const uniqueSubscriptions = subscriptionManager.getUniqueSubscriptions();

    expect(uniqueSubscriptions).toContain(symbol1);
    expect(uniqueSubscriptions).toContain(symbol2);
    expect(uniqueSubscriptions.length).toBe(2);
  });

  it('should handle subscriptions and unsubscriptions for unique symbols', () => {
    const symbol1 = 'btc';
    const symbol2 = 'eth';

    subscriptionManager.subscribe(symbol1);
    subscriptionManager.subscribe(symbol2);
    subscriptionManager.unsubscribe(symbol1);

    expect(subscriptionManager.hasSubscriptions(symbol1)).toBe(false);
    expect(subscriptionManager.hasSubscriptions(symbol2)).toBe(true);
  });
});
