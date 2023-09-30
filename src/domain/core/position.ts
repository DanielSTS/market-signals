import { Trade } from './trade';

export class Position {
  private state = 'open';
  readonly enterTrade: Trade;
  exitTrade?: Trade;
  readonly id: string;
  constructor(enterTrade: Trade, id: string) {
    this.enterTrade = enterTrade;
    this.id = id;
  }

  getState(): string {
    return this.state;
  }
  close(exitTrade: Trade) {
    this.state = 'closed';
    this.exitTrade = exitTrade;
  }

  print() {
    const enter = `Enter | ${this.enterTrade.price} | ${this.enterTrade.time}`;
    const exit = this.exitTrade
      ? `Exit: | ${this.exitTrade.price} | ${this.exitTrade.time}`
      : '';

    let profit = '';
    if (this.state === 'closed') {
      profit = `Profit: ${this.profitString()}`;
    }

    console.log(`${enter} - ${exit} - ${profit}`);
  }

  profit() {
    const fee = 0.0025;
    const entrance = this.enterTrade.price * (1 + fee);
    if (this.exitTrade) {
      const exit = this.exitTrade.price * (1 - fee);
      return exit - entrance;
    } else {
      return 0;
    }
  }

  profitString() {
    return this.profit().toFixed(2);
  }
}
