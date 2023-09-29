import { Arbitrage } from './arbitrage';
import { Simple } from './simple';
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
      return new Simple(callbacks);
  }
}
