import Trade from './trade';

export type PositionState = 'OPEN' | 'CLOSED';

export default class Position {
  private _state: PositionState = 'OPEN';
  readonly enterTrade: Trade;
  exitTrade?: Trade;
  readonly id: string;
  private _profit: number = 0;
  constructor(enterTrade: Trade, id: string) {
    this.enterTrade = enterTrade;
    this.id = id;
  }

  get state(): PositionState {
    return this._state;
  }

  get profit(): number {
    return this._profit;
  }

  close(exitTrade: Trade) {
    this._state = 'CLOSED';
    this.exitTrade = exitTrade;
    const fee = 0.0025;
    const entrance = this.enterTrade.price * (1 + fee);
    const exit = this.exitTrade.price * (1 - fee);
    this._profit = exit - entrance;
  }
}
