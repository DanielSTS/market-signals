export class SubscriptionManager {
  private subscriptions = new Map<string, number>();

  subscribe(symbol: string): void {
    if (this.subscriptions.has(symbol)) {
      this.subscriptions.set(symbol, this.subscriptions.get(symbol)! + 1);
    } else {
      this.subscriptions.set(symbol, 1);
    }
  }

  unsubscribe(symbol: string): void {
    if (this.subscriptions.has(symbol)) {
      const count = this.subscriptions.get(symbol)! - 1;
      if (count === 0) {
        this.subscriptions.delete(symbol);
      } else {
        this.subscriptions.set(symbol, count);
      }
    }
  }

  hasSubscriptions(symbol: string): boolean {
    return this.subscriptions.has(symbol);
  }

  getUniqueSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }
}
