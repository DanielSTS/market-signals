import Strategy from '../strategy/strategy';
import FactoryStrategyCreate from '../strategy/factory';
import Timeframe from '../core/timeframe';
import Instrument from '../core/instrument';
import Position from '../oms/position';

export default abstract class Runner {
  protected strategy: Strategy;
  _stats = {
    payoff: 0,
    drawdown: 0,
    profit: 0,
    winRate: 0
  };
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

  get positions(): Position[] {
    return this.strategy.getPositions();
  }
  get stats(): any {
    return this._stats;
  }

  protected calculateStats() {
    this._stats = {
      payoff: this.calculatePayoff(),
      drawdown: this.calculateDrawdown(),
      profit: this.calculateProfit(),
      winRate: this.calculateWinRate()
    };
  }

  private calculatePayoff(): number {
    const positions = this.positions;
    const totalProfit = positions.reduce(
      (sum, position) => sum + position.profit,
      0
    );
    const totalInvestment = positions.reduce(
      (sum, position) =>
        sum + position.enterTrade.price * position.enterTrade.quantity,
      0
    );
    return totalInvestment !== 0 ? totalProfit / totalInvestment : 0;
  }

  private calculateDrawdown(): number {
    let maxDrawdown = 0;
    const positions = this.positions;
    if (positions.length === 0) {
      return 0;
    }
    let peak = positions[0].profit;
    for (let i = 1; i < positions.length; i++) {
      const tradeProfit = positions[i].profit;
      if (tradeProfit > peak) {
        peak = tradeProfit;
      }
      const drawdown = (peak - tradeProfit) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    return maxDrawdown;
  }

  private calculateProfit(): number {
    const positions = this.positions;
    const totalProfit = positions.reduce(
      (sum, position) => sum + position.profit,
      0
    );
    return totalProfit;
  }

  private calculateWinRate(): number {
    const positions = this.positions;
    const totalWins = positions.filter(position => position.profit > 0).length;
    const totalTrades = positions.length;
    const winRate = (totalWins / totalTrades) * 100;
    return winRate;
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
