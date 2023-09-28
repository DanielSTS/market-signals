import { Strategy } from './strategy';
import { FactoryStrategyCreate } from './factory';
import { Position } from './position';

export abstract class Runner {
  protected strategy: Strategy;
  protected constructor(
    readonly start: Date,
    readonly end: Date,
    readonly interval: string,
    readonly symbol: string,
    readonly strategyType: string,
    readonly strategyParams: any
  ) {
    this.strategy = FactoryStrategyCreate(this.strategyType, strategyParams, {
      onBuySignal: this.onBuySignal.bind(this),
      onSellSignal: this.onSellSignal.bind(this)
    });
  }

  printPositions() {
    const positions = this.strategy.getPositions();
    positions.forEach(p => {
      p.print();
    });
  }

  printProfit() {
    const positions = this.strategy.getPositions();
    const total = positions.reduce((r, p) => {
      return r + p.profit();
    }, 0);

    const prof = `${total}`;
    console.log(`Total: ${prof}`);
  }

  abstract onBuySignal(price: number, time: Date): void;

  abstract onSellSignal(
    price: number,
    size: number,
    time: Date,
    position: Position
  ): void;
}
