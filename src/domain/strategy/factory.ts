import Arbitrage from './arbitrage';
import BollingerBands from './bollinger-bands';
import { StrategyCallbacks } from './strategy';

export default function FactoryStrategyCreate(
  type: string,
  params: any,
  callbacks: StrategyCallbacks
) {
  switch (type) {
    case 'arbitrage':
      return new Arbitrage(params, callbacks);
    case 'bollinger-bands':
      return new BollingerBands(20, 2, callbacks);
    default:
      throw new Error('Strategy not found');
  }
}
