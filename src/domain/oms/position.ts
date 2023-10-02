import Trade from './trade';

type PositionState = 'OPEN' | 'CLOSED';

export default class Position {
  private state: PositionState = 'OPEN';
  readonly enterTrade: Trade;
  exitTrade?: Trade;
  readonly id: string;
  constructor(enterTrade: Trade, id: string) {
    this.enterTrade = enterTrade;
    this.id = id;
  }

  get State(): PositionState {
    return this.state;
  }
  close(exitTrade: Trade) {
    this.state = 'CLOSED';
    this.exitTrade = exitTrade;
  }

  print() {
    const enter = `Enter | ${this.enterTrade.price} | ${this.enterTrade.time}`;
    const exit = this.exitTrade
      ? `Exit: | ${this.exitTrade.price} | ${this.exitTrade.time}`
      : '';

    let profit = '';
    if (this.state === 'CLOSED') {
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
