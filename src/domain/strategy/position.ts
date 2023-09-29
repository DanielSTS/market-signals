import { Trade } from './trade';

export class Position {
  state: string;
  readonly enter: Trade;
  exit?: Trade;
  readonly id: string;
  constructor(trade: Trade, id: string) {
    this.state = 'open';
    this.enter = trade;
    this.id = id;
  }

  close(trade: Trade) {
    this.state = 'closed';
    this.exit = trade;
  }

  print() {
    const enter = `Enter | ${this.enter.price} | ${this.enter.time}`;
    const exit = this.exit
      ? `Exit: | ${this.exit.price} | ${this.exit.time}`
      : '';

    let profit = '';
    if (this.state === 'closed') {
      profit = `Profit: ${this.profitString()}`;
    }

    console.log(`${enter} - ${exit} - ${profit}`);
  }

  profit() {
    const fee = 0.0025;
    const entrance = this.enter.price * (1 + fee);
    if (this.exit) {
      const exit = this.exit.price * (1 - fee);
      return exit - entrance;
    } else {
      return 0;
    }
  }

  profitString() {
    return this.profit().toFixed(2);
  }
}
