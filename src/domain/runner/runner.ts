import Strategy from '../strategy/strategy';
import FactoryStrategyCreate from '../strategy/factory';
import Position from '../core/position';
import Timeframe from '../core/timeframe';
import Instrument from '../core/instrument';

export default abstract class Runner {
  protected strategy: Strategy;
  protected constructor(
    readonly timeframe: Timeframe,
    readonly instrument: Instrument,
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
    console.log(`Total: ${total}`);
  }

  abstract onBuySignal(price: number, time: Date): void;

  abstract onSellSignal(
    price: number,
    quantity: number,
    time: Date,
    position: Position
  ): void;

  abstract start(): void;
}
