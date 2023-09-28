import { Arbitrage } from './arbitrage';
import { CrossAverage } from './cross-average';
import { StrategyCallbacks } from './strategy';

export function FactoryStrategyCreate(
  type: string,
  params: any,
  callbacks: StrategyCallbacks
) {
  switch (type) {
    case 'arbitrage':
      return new Arbitrage(params, callbacks);
    default:
      return new CrossAverage(callbacks);
  }
}
